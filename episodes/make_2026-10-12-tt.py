# make_2026-10-12-tt.py: writes episodes/2026-10-12-tt.json, the TikTok cut of "Beat It" (Michael Jackson) on TikTok's
# official sound (Michael Jackson's own, music id 6696417475073935361, 60 s, 951,108 videos; the night's song pick had
# found it and placed it coarsely, ~/personal/saxo-video/songs/beat-it/tt_align.py, its preview saved beside it): song
# 65.0099 + 1.000817 x tt (tt_rate.py there: 29 log-spectrum pieces of 3 s, 0.7 ms residual: it plays 0.08% fast against
# our master), i.e. the main kit's -0.4993 to 59.5497 s (main b-2.15 to b136.67). TikTok muted the main post (itemMute),
# 2026-10-12 16:00; the post check's hide read back "Everyone", the run's retry found it "Only me".
# The sound is the main cut itself, starting 0.4993 s earlier (the last word of the line before the chorus) and ending
# 20 s sooner: chorus 1, verse 2 and chorus 2's first four lines are inside it; the collapse, Sadi's last throw and the
# button (Kob's lazy flick) lie past its end. Chorus 2 sings its four lines twice (a line-hash check of the kit: K21-K24
# are K17-K20 32 beats later, the title only on the first line of each four), so the payoff's shots move onto the first
# four, squeezed. The video is the sound's first 138 beats (59.6436 s), so the loop keeps the beat. The kit's grid starts
# on main kit beat 0 (the chorus's downbeat, the first downbeat inside the sound, at 0.931092 s), so tt beat = main beat:
#   tt 0 s-b111        the main's shots (main b-1-b111), the hook 0.4989 s longer at its start (its clips set back by as
#                      much, so the charleston stays on the music)
#   tt b111-b119       the throwing chorus line and the catch in the alley (main S28, S29), on their own bars
#   tt b119-b126       everyone flat on the floor, the dog dancing by the pile, paws up (main S34, b152; 'defeated' 4.3
#                      beats in, where the main had it 3.2 beats in)
#   tt b126-b129.69    he drops the ball on Kob, flat on her back (main S36, b166: 3.69 beats of its 9; the drop lands in
#                      its first 0.45 s)
#   tt b129.69-b134.6  her lazy flick: the ball rolls 10 cm on 'strong' (b132.0), he pounces on it (b133.74) (main S37,
#                      b175: 4.91 beats of its 7)
#   tt b134.6-end      the button: the ball on her again, nobody moves (main S38, b182: 1.25 beats where the main had 1)
# Lost with the sound's end: the throwers sitting out of breath, the row dropped flat, the two leaders the last ones up,
# the dog dancing among the bodies, Sadi's last throw. Built from episodes/2026-10-12.json (run make_2026-10-12.py
# first). Uploaded silent: the official sound is added in TikTok Studio. Every actor and map timing in these shots counts
# from the shot's start, so a moved shot keeps them.
import copy, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ID, MAIN = '2026-10-12-tt', '2026-10-12'
RATE = 1.000817                                    # song seconds per tt second (the sound plays 0.08% fast)
PER = 60 / 138.7113 / RATE                         # a tt beat
T0 = 0.931092                                      # tt time of tt beat 0 (main kit beat 0)
PRE = 0.4989                                       # tt time of the main's first frame (main kit beat -1)
END = 59.6436                                      # the video: the sound's first 138 beats
END_B = (END - T0) / PER
assert abs(END_B - 135.8457) < 0.002 and abs(T0 - PER - PRE) < 0.001, (END_B, T0 - PER)
main = json.load(open(os.path.join(HERE, MAIN + '.json')))
M = {s['beat']: s for s in main['shots']}
T = lambda b: round(T0 + b * PER, 3)               # tt beat -> tt seconds

def moved(mb, tb=None, what=None):
    """main shot mb at tt beat tb (default: its own bar); its timings count from the shot's start"""
    tb = mb if tb is None else tb
    s = copy.deepcopy(M[mb]); s['beat'] = round(tb, 3)
    s['lyric'] = f"(tt {max(T(tb), 0)} s, main beat {mb}) " + (what or s.get('lyric', ''))
    return s

def actor(s, who):
    return next(a for a in s['actors'] if a['who'] == who)

# ---- the hook: the video starts 0.4989 s before the main's first frame, so its clips start that much earlier ----
HOOK = moved(-1)
assert [(a['who'], a['clip'], a['at'], a.get('speed', 1)) for a in HOOK['actors']] == [
    ('saxo', 'charleston', 1.45, 1), ('kob', 'happy_idle', 0.3, 0.1), ('compote', 'happy_idle', 0.3, 0.1)], HOOK['actors']
for a in HOOK['actors']:
    a['at'] = round(a['at'] - PRE * a.get('speed', 1), 4)
HOOK['lyric'] = HOOK['lyric'].replace(') ', f', {PRE} s longer at its start) ', 1)
STORY = [HOOK] + [moved(mb) for mb in sorted(M) if -1 < mb < 119]
assert STORY[-1]['beat'] == 115 and actor(STORY[-1], 'saxo')['fetch'] == 'ball', 'the catch in the alley moved'

# ---- the payoff, squeezed onto chorus 2's first four lines (the same words as the main's second four) ----
COLLAPSE = moved(152, 119, "'no one wants to be defeated': everyone flat on the floor, the dog dancing in the middle by "
                 "the pile, paws up (7 beats, as in the main)")
assert actor(COLLAPSE, 'kob')['clip'] == 'knocked_out_falling_to_back' and actor(COLLAPSE, 'compote')['clip'] == 'knocked_out_falling_to_back'
DROP_B, FLICK_B, BUTTON_B = 126, 129.69, 134.6
DROP = moved(166, DROP_B, "he drops the ball on Kob, flat on her back, and waits, tail up (3.69 beats of the main's 9)")
assert DROP['throws'][0][0] == 0.1 and DROP['throws'][0][8] == 0.35, DROP['throws']   # it lands 0.45 s in
FLICK = moved(175, FLICK_B, "she flicks it ten centimetres with one claw, on 'strong'; he pounces on it, proud (4.91 "
              "beats of the main's 7)")
k_up, ball_at, grab_at = actor(FLICK, 'kob')['upAt'], FLICK['throws'][0][0], actor(FLICK, 'saxo')['fetch']['at']
assert (k_up, ball_at, grab_at) == (0.85, 1.0, 1.75), (k_up, ball_at, grab_at)
assert abs(FLICK_B + ball_at / PER - 132.0) < 0.02, 'the flick is off its word'
BUTTON = moved(182, BUTTON_B, "the button: the ball on the cat again; nobody moves (1.25 beats, on the next line's first "
               "word; the main had one silent beat)")
assert BUTTON.get('still') is True
assert DROP['cam'] == FLICK['cam'] == BUTTON['cam'], 'the button is one lens'
shots = STORY + [COLLAPSE, DROP, FLICK, BUTTON]

for sh in shots:
    assert not any(k2.startswith('word') for k2 in sh), sh['lyric']
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
beats = [s['beat'] for s in shots]
assert beats == sorted(beats) and len(set(beats)) == len(beats), 'shots out of order'
assert T(FLICK_B) + grab_at < T(BUTTON_B) - 0.3, 'no time to see the pounce'
assert T(beats[-1]) < END - 0.5, 'the last shot is too short'
clips = {a['clip'] for s in shots for a in s['actors']}
ep = {**{k2: v for k2, v in main.items() if k2 not in ('shots', 'clips', 'song', 'n', 'yt', 'new', 'notes', 'logline')},
      'n': '1-tt',
      'song': {'title': 'Beat It', 'artist': 'Michael Jackson', 'window': [65.0099, 125.0589], 'rate': RATE, 'bpm': 138.8246,
               'tiktok_sound': {'music_id': '6696417475073935361', 'title': 'Beat It', 'author': 'Michael Jackson',
                                'seconds': 60, 'videos': 951108}},
      'logline': "The alley cats and the bunny gang meet in a warehouse for a rumble, and every time someone tells the dog "
                 "in the red jacket to beat it, they throw something out of the door and he brings it back, until both "
                 "gangs drop flat on the floor; he drops the ball on the cats' leader, and her lazy flick sends him "
                 "pouncing for more.",
      'new': ["the TikTok cut keeps the main's shots on their own bars (the official sound is the main cut itself, 0.5 s "
              "earlier and 20 s shorter, at 0.08% faster) and squeezes the collapse and the lazy-flick button onto chorus "
              "2's first four lines, which sing the same words as the main's last four; 138 beats, so the loop keeps the beat"],
      'notes': "TikTok muted the main post (itemMute, 2026-10-12). The official sound (Michael Jackson's own, 951,108 "
               "videos, 60 s) is song 65.0099 + 1.000817 x tt (29 log-spectrum pieces of 3 s, 0.7 ms residual), the main "
               "kit's -0.4993 to 59.5497 s (tt beat = main beat). See the generator's header.",
      'clips': sorted(c for c in clips if c in set(main['clips'])), 'shots': shots}
ep['tags'] = {**main['tags'],
              'experiment': main['tags'].get('experiment', '') + " (TikTok cut on the 60 s official sound: the main's "
              "shots on their own bars, the collapse and the lazy-flick button squeezed into its last 17 beats)"}
out = os.path.join(HERE, ID + '.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots,', len(ep['clips']), 'clips (not in the main list:', sorted(clips - set(main['clips'])), ')')
print(f'collapse {T(119)} s, drop {T(DROP_B)} s (lands {T(DROP_B) + 0.45:.3f}), flick {T(FLICK_B)} s (ball moves '
      f'{T(FLICK_B) + ball_at:.3f}, grabbed {T(FLICK_B) + grab_at:.3f}), button {T(BUTTON_B)}-{END} s')
starts = [T(s['beat']) if i else 0 for i, s in enumerate(shots)]
ends = starts[1:] + [END]
print('shot starts:', ','.join(map(str, starts)))
print('sheet times:', ','.join(str(round((a + b) / 2, 2)) for a, b in zip(starts, ends)))
print('first and last frames:', 0.0, round(int(round(END * 30) - 1) / 30, 3))
