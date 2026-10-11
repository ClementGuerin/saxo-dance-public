# make_2026-10-11-tt.py: writes episodes/2026-10-11-tt.json, the TikTok cut of "Dracula (JENNIE Remix)" (Tame Impala &
# JENNIE) on TikTok's official sound (Tame Impala's own "Dracula (with JENNIE)", music id 7603221525400455169, 52 s,
# 1,337,255 videos; first in the plain and the most-used searches, `filter_by=title` listed other songs called
# Dracula): song 62.7302-114.7433 s at the song's own speed (~/personal/saxo-video/songs/dracula/tt_rate.py: 25
# log-spectrum pieces of 3 s, 0.8 ms residual, rate 1.000006). TikTok muted the main post (itemMute), 2026-10-11
# 16:00; the post check's hide read back "Everyone", the run's retry found it "Only me".
# The sound is the main cut minus its first 31 beats: the main kit's 16.1870 s on (main beat 31.028, pre-chorus 1's last
# beat), verse 2, pre-chorus 2, chorus 1 and its outro bar to the main kit's end (main b128), then 2.73 beats of the
# break. The video is the sound's first 97 beats (50.6039 s): ending 0.03 beats after the main's last downbeat, the
# loop keeps the beat (the sound starts 0.972 beats before verse 2's downbeat). The kit's grid starts on main beat 32
# (verse 2's downbeat, the first downbeat inside the sound, at 0.5071 s), so tt beat = main beat - 32:
#   tt 0 s-b0        the cold open (main S00, b0-1.5): the count sunbathing in shades, close, from above his feet (how
#                    did he get here?), 0.972 beats (0.507 s) where the main had 1.5, its push cut to that share; it
#                    is the button's frame, so the loop lands back on it as the main's did
#   tt b0-b96.03     the main's shots on their own bars (main b32-b128), unchanged: the sky goes pink (now flashed in
#                    from the cold open on verse 2's downbeat, as the main's hook was), back into the dark house, the
#                    rig and its chain, the bite that is a lick, the boarded windows, the first ray, the runs from the
#                    sunbeams, Kob in the sun, the corner, the house towed away, and the button: the four belly up
# Lost with the sound's start: pre-chorus 1 (the yard party at night, Kob's alarm clock). Built from
# episodes/2026-10-11.json (run make_2026-10-11.py first). Uploaded silent: the official sound is added in TikTok
# Studio. Every actor and map timing in these shots counts from the shot's start (maps41.js `shotT`), so a moved shot
# keeps them.
import copy, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ID, MAIN = '2026-10-11-tt', '2026-10-11'
PER = 60 / 115.0108                                # a beat (the sound plays the song at its own speed)
DT0 = 0.5071                                       # tt time of tt beat 0 (main beat 32, verse 2's downbeat)
SHIFT = 32                                         # tt beat = main beat - SHIFT
END = 50.6039                                      # the video: the sound's first 97 beats
END_B = (END - DT0) / PER
assert abs(END_B - 96.028) < 0.002, END_B
main = json.load(open(os.path.join(HERE, MAIN + '.json')))
M = {s['beat']: s for s in main['shots']}
T = lambda b: round(DT0 + b * PER, 3)              # tt beat -> tt seconds

def moved(mb, tb=None, what=None):
    """main shot mb at tt beat tb (default: its own bar, mb - SHIFT); its timings count from the shot's start"""
    tb = mb - SHIFT if tb is None else tb
    s = copy.deepcopy(M[mb]); s['beat'] = round(tb, 3)
    s['lyric'] = f"(tt {max(T(tb), 0)} s, main beat {mb}) " + (what or s.get('lyric', ''))
    return s

# ---- the cold open: the main's S00 in the sound's first 0.972 beats; its push cut to that share of its 1.5 beats ----
COLD = moved(0, -DT0 / PER)
share = (DT0 / PER) / 1.5
assert [a['who'] for a in COLD['actors']] == ['saxo'] and COLD['actors'][0]['speed'] == 0, COLD['actors']
for k in ('ang', 'r', 'h'):
    v0, v1 = COLD['cam'][k]
    COLD['cam'][k] = [v0, round(v0 + (v1 - v0) * share, 3)]
COLD['lyric'] = COLD['lyric'].replace(') ', f', {round(DT0, 3)} s where the main had {round(1.5 * PER, 3)}) ', 1)

# ---- the story on its own bars: verse 2's first shot is flashed in from the cold open, as the main's hook was ----
assert M[1.5].get('flashAt') == [0] and not M[32].get('flashAt'), 'the main hook flash moved'
STORY = [moved(mb) for mb in sorted(M) if mb >= SHIFT]
STORY[0]['flashAt'] = [0]
STORY[0]['lyric'] += ' (flashed in from the cold open)'
shots = [COLD] + STORY

for sh in shots:
    assert not any(k2.startswith('word') for k2 in sh), sh['lyric']
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
beats = [s['beat'] for s in shots]
assert beats == sorted(beats) and len(set(beats)) == len(beats), 'shots out of order'
assert T(beats[-1]) < END - 0.8, 'the last shot is too short'
assert M[122.83]['actors'][0]['clip'] == 'laying_idle' and beats[-1] == 90.83, 'the button moved'
clips = {a['clip'] for s in shots for a in s['actors']}
ep = {**{k2: v for k2, v in main.items() if k2 not in ('shots', 'clips', 'song', 'n', 'yt', 'new', 'notes', 'logline')},
      'n': '1-tt',
      'song': {'title': 'Dracula', 'artist': 'Tame Impala, JENNIE', 'window': [62.7302, 114.7433], 'rate': 1, 'bpm': 115.0108,
               'tiktok_sound': {'music_id': '7603221525400455169', 'title': 'Dracula (with JENNIE)', 'author': 'Tame Impala',
                                'seconds': 52, 'videos': 1337255}},
      'logline': "Dracula Saxo's all-night party at his farmhouse must never see the light of day: the sky goes pink and "
                 "they run back into the dark house, while a big rig hooks a chain onto it; they board up the windows, "
                 "but at sunrise the light comes through every gap and they run from each sunbeam on every 'run', the "
                 "cat lies down in one, and the truck tows the whole house away: the vampires end up sunbathing, belly "
                 "up, because they're pets.",
      'new': ["the TikTok cut keeps the main's shots from verse 2 on their own bars (the official 52 s sound is the main "
              "cut minus pre-chorus 1, plus 2.7 beats of the break) and puts the main's cold open, the count sunbathing, "
              "in the sound's first beat, flashing into the dawn; 97 beats, so the loop keeps the beat"],
      'notes': "TikTok muted the main post (itemMute, 2026-10-11). The official sound (Tame Impala's own, 1,337,255 "
               "videos, 52 s) is song 62.7302-114.7433 s at the song's own speed (25 log-spectrum pieces of 3 s, 0.8 ms "
               "residual): the main kit's 16.1870 s on (tt beat = main beat - 32). See the generator's header.",
      'clips': sorted(c for c in clips if c in set(main['clips'])), 'shots': shots}
ep['tags'] = {**main['tags'],
              'experiment': main['tags'].get('experiment', '') + " (TikTok cut on the 52 s official sound: the main's "
              "shots from verse 2 on their own bars, the cold open in the sound's first beat)"}
out = os.path.join(HERE, ID + '.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots,', len(ep['clips']), 'clips (not in the main list:', sorted(clips - set(main['clips'])), ')')
starts = [T(s['beat']) if i else 0 for i, s in enumerate(shots)]
ends = starts[1:] + [END]
print('shot starts:', ','.join(map(str, starts)))
print('sheet times:', ','.join(str(round((a + b) / 2, 2)) for a, b in zip(starts, ends)))
print('first and last frames:', 0.0, round(int(round(END * 30) - 1) / 30, 3))
