# make_2026-09-28-4-tt.py: writes episodes/2026-09-28-4-tt.json, the TikTok cut of "Dai Dai" (Shakira & Burna Boy) on
# TikTok's official sound (their own, music id 7637147165290924831, 60 s, 2,693,893 videos): the song's last section,
# song = 177.7216 + 1.000977 x tt s (0.1% faster than the song; episodes/2026-09-28-4-tt.config.js). TikTok muted the main
# post (itemMute: copyrighted), 2026-09-29.
# The sound is the intro's hook reprised (tt b0-48), then the title hook four times (b48-80, the main's K00-K01 bar for
# bar: tt beat 64 = main b0), and the music stops on tt b80 (41.80 s); the last 18 s are near silence, so the video
# ends at 42.30 s. The main's own ending falls on its b128, the downbeat where verse 2 comes in, and its title-hook
# lines on 8-bar steps, so the main's second half moves over on one shift, tt beat = main beat - 48:
#   tt b-0.89..4  the main's b48 shot (Kob's poke trickling into the net, the keeper dived the wrong way), opening at
#                 0 s, 0.46 s into it: the cold open is the third penalty going in
#   tt b4..62     the main's b52-b110 shots as they are: the teammates waiting, Saxo the captain setting the ball down
#                 and walking back for his run-up, out through the tunnel, round the world (the pyramids, Tokyo, the
#                 snow, the tiny Earth, the baobab), the keeper dancing out of boredom and falling asleep, sunrise, the
#                 sprint back in and the smash (main b110 = tt b62, on the third title hook)
#   tt b66..80    the keeper wakes on the hook's "dai dai" (main b114 = tt b66, 0.6 beat after its word), the World Cup
#                 won, the fireworks with Kob unimpressed, held through the music's last hit and 0.5 s of silence
# Lost from the main: the first two penalties (Compote's and Sadi's): the line-up's last taker and the captain carry it.
# Built from episodes/2026-09-28-4.json (run make_2026-09-28-4.py first). Uploaded silent: the official sound is added
# by TikTok Studio. Every actor, trail and map timing counts from the shot's start, so a moved shot keeps them.
import copy, json, os

BPM = 116.1133
P = 60 / BPM
B0 = 0.4585
END = 42.30
MUSIC_END = 80                                     # tt beat of the music's last hit (41.80 s)
SHIFT = 48                                         # tt beat = main beat - SHIFT
T = lambda b: round(B0 + b * P, 3)                 # tt beat -> tt seconds
HERE = os.path.dirname(os.path.abspath(__file__))
main = json.load(open(os.path.join(HERE, '2026-09-28-4.json')))
M = {s['beat']: s for s in main['shots']}


def moved(mb, what=None, **o):
    """main shot mb at tt beat mb - SHIFT (its timings count from the shot's start)"""
    s = copy.deepcopy(M[mb]); s['beat'] = round(mb - SHIFT, 3)
    s['lyric'] = f"(tt {T(mb - SHIFT)} s, main beat {mb}) " + (what or s.get('lyric', ''))
    s.update(o)
    return s


opening = moved(48, what="COLD OPEN: Kob's poke trickles into the net, the keeper dived the wrong way; the video opens 0.46 s "
                "into the main's shot, on the sound's first frame")
opening['beat'] = round(-B0 / P, 3)


def continued(s, beat, what):
    """shot s going on from tt `beat` (a later cut into the same moment): clips and fireworks where they were, no reveals"""
    t = copy.deepcopy(s); dt = round((beat - s['beat']) * P, 3); t['beat'] = beat
    t['lyric'] = f"(tt {T(beat)} s) " + what
    for a in t['actors']:
        a.pop('reveal', None)
        if isinstance(a.get('at'), (int, float)): a['at'] = round(a['at'] + a.get('speed', 1) * dt, 3)
    if isinstance(t.get('fw'), (int, float)): t['fw'] = round(t['fw'] - dt, 3)
    return t


# the main's last shot keeps its own length (its pull-back spans the shot: stretched to the video's end, it held Kob at
# the frame's edge), then the music's last hit and the silence after it hold its last frame, the camera still
last = moved(122)
tail = continued(last, MUSIC_END, "the music's last hit and 0.5 s of silence: the fireworks wide held still where the pull-back ended")
c = last['cam']
tail['cam'] = {**c, 'ang': [c['ang'][1]] * 2, 'r': [c['r'][1]] * 2, 'h': [c['h'][1]] * 2, 'look': [c['look'][1]] * 2,
               'roll': [c['roll'][1]] * 2}
tail['still'] = True
shots = [opening] + [moved(b) for b in sorted(M) if 52 <= b < 122] + [last, tail]
assert [s['beat'] for s in shots] == sorted(s['beat'] for s in shots), 'shots out of order'
assert abs(T(shots[0]['beat'])) < 0.002 and T(last['beat']) < T(MUSIC_END) - 2.5 and T(MUSIC_END) < END
assert T(110 - SHIFT) < T(64) < T(114 - SHIFT), 'the smash and the wake should frame the third title hook'
for sh in shots:
    assert not any(k.startswith('word') for k in sh), sh['lyric']
clips = {a['clip'] for s in shots for a in s['actors']} | {s['crowd']['clip'] for s in shots if s.get('crowd')}
ep = {**{k: v for k, v in main.items() if k not in ('shots', 'clips', 'song', 'n', 'new', 'notes', 'logline')},
      'n': '4-tt',
      'song': {'title': 'Dai Dai', 'artist': 'Shakira & Burna Boy', 'window': [177.722, 219.563], 'rate': 1.000977,
               'bpm': BPM, 'tiktok_sound': '7637147165290924831'},
      'logline': main['logline'],
      'notes': "TikTok muted the main post (itemMute, 2026-09-29). The official sound (Shakira & Burna Boy's own, 2,693,893 "
               "videos, 60 s) is the song's last section, song 177.72 s on, 0.1% faster, its music stopping at 41.80 s: the "
               "intro's hook reprised, then the title hook four times. The main's second half (Kob's goal as a cold open, "
               "then the captain's run-up round the world, the smash and the fireworks) moves over on one 48-beat shift, "
               "its ending on the music's last hit; the video ends at 42.30 s.",
      'clips': sorted(c for c in clips if c in set(main['clips'])), 'shots': shots}
out = os.path.join(HERE, '2026-09-28-4-tt.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots; first', T(shots[0]['beat']), 's; last', T(shots[-1]['beat']), '-', END, 's')
starts = [max(T(s['beat']), 0) for s in shots]
print('sheet times:', ','.join(str(round((starts[i] + (starts[i + 1] if i + 1 < len(shots) else END)) / 2, 2)) for i in range(len(shots))))
