# make_2026-10-13-tt.py: writes episodes/2026-10-13-tt.json, the TikTok cut of "Gabriela" (KATSEYE) on TikTok's
# official sound (KATSEYE's own, music id 7515269970908252177, 60 s, 822,934 videos; found with the song): song
# 30.0558-90.0558 s at the song's own speed (~/personal/saxo-video/songs/gabriela/tt_rate.py: 29 log-spectrum pieces of
# 3 s, 0.6 ms residual), i.e. the main kit's -2.2661 to 57.7339 s. Made with the video (the user, 2026-10-12: every new
# video's TikTok is its official-sound cut).
# The main cut was picked to hold the sound's window: the sound starts 2.27 s before the main (the pre-chorus's last line
# and its dead silence) and ends 2.5 bars into chorus 2, right after the payoff (the flash on chorus 2's drop, the
# photo, the CEO's gasp, the kitten busted, paws up). So:
#   tt 0-2.266 s     a cold open on the payoff's evidence: the instant photo of the kitten's paws in the cake, already
#                    developed (the main's flash frame with `photo` -1), over the pre-chorus's last line
#   tt 2.266 s-end   the main's shots on their own beats (tt beat = main beat; the hook flash-cut in from the photo),
#                    to 2.49 beats into the busted kitten's shot
# The video is the sound's first 146 beats (59.9955 s), so the loop keeps the beat: it ends on the kitten caught, paws
# up, and loops into the photo that caught her. Built from episodes/2026-10-13.json (run make_2026-10-13.py first).
# Uploaded silent: the official sound is added in TikTok Studio. Every actor and map timing counts from the shot's start,
# so a moved shot keeps them.
import copy, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ID, MAIN = '2026-10-13-tt', '2026-10-13'
PER = 60 / 146.011                                 # a beat (the sound plays at the song's own speed)
T0 = 3.0879                                        # tt time of tt beat 0 (main kit beat 0, chorus 1's downbeat)
PRE = 2.2661                                       # tt time of the main's first frame (main kit beat -2)
END = 59.9955                                      # the video: the sound's first 146 beats
END_B = (END - T0) / PER
assert abs(T0 - 2 * PER - PRE) < 0.002 and abs(END_B - 138.49) < 0.01, (T0 - 2 * PER, END_B)
main = json.load(open(os.path.join(HERE, MAIN + '.json')))
M = {s['beat']: s for s in main['shots']}
T = lambda b: round(T0 + b * PER, 3)

def moved(mb, tb=None, what=None):
    tb = mb if tb is None else tb
    s = copy.deepcopy(M[mb]); s['beat'] = round(tb, 3)
    s['lyric'] = f"(tt {max(T(tb), 0)} s, main beat {mb}) " + (what or s.get('lyric', ''))
    return s

# ---- the cold open: the photo that caught her, already developed (the main's flash frame, its card shown at once) ----
COLD = moved(128, -7.51, "the cold open: the instant photo of the kitten with both paws in the CEO's cake, already developed")
COLD['photo'] = -1; COLD.pop('flashAt', None)
assert COLD.get('still') is True and COLD['actors'][0]['who'] == 'kob'
# ---- the story: the main's shots on their own beats, the hook flash-cut in from the photo ----
STORY = [moved(mb) for mb in sorted(M) if -2 <= mb < END_B]
STORY[0]['flashAt'] = [0.0]
assert STORY[0]['beat'] == -2 and STORY[-1]['beat'] == 136, (STORY[0]['beat'], STORY[-1]['beat'])
shots = [COLD] + STORY
beats = [s['beat'] for s in shots]
assert beats == sorted(beats) and len(set(beats)) == len(beats), 'shots out of order'
assert END - T(beats[-1]) > 0.8, 'the last shot is too short'
for sh in shots:
    assert not any(k2.startswith('word') for k2 in sh)
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
clips = {a['clip'] for s in shots for a in s['actors']}
ep = {**{k2: v for k2, v in main.items() if k2 not in ('shots', 'clips', 'song', 'yt', 'new', 'notes', 'logline')},
      'song': {'title': 'Gabriela', 'artist': 'KATSEYE', 'window': [30.0558, 90.0558], 'rate': 1.0, 'bpm': 146.011,
               'tiktok_sound': {'music_id': '7515269970908252177', 'title': 'Gabriela', 'author': 'KATSEYE', 'seconds': 60, 'videos': 822934}},
      'logline': main['logline'],
      'new': ["the TikTok cut keeps the main's shots on their own beats (the official sound starts 2.27 s before the main cut "
              "and ends 2.5 bars after the payoff) and opens on the payoff's photo; 146 beats, so the loop keeps the beat"],
      'notes': "The official sound (KATSEYE's own, 822,934 videos, 60 s) is song 30.0558-90.0558 s (29 log-spectrum pieces "
               "of 3 s, 0.6 ms residual), the main kit's -2.2661 to 57.7339 s (tt beat = main beat). See the generator's header.",
      'clips': sorted(clips), 'shots': shots}
ep['tags'] = {**main['tags'], 'experiment': main['tags'].get('experiment', '') + " (TikTok cut on the 60 s official sound: the main's shots on their own beats, opened on the payoff's photo)"}
out = os.path.join(HERE, ID + '.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
starts = [T(s['beat']) if i else 0 for i, s in enumerate(shots)]
print(out, len(shots), 'shots; first shots at', starts[:3], '; last at', starts[-1], 'to', END)
