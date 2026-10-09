# make_2026-10-09-2-tt.py: writes episodes/2026-10-09-2-tt.json, the TikTok cut of "Espresso" (Sabrina Carpenter) on
# TikTok's official sound (Sabrina Carpenter's own, music id 7364498342501435408, 60 s, 527,734 videos; first in the
# plain and the most-used searches, `filter_by=title` listed covers and a 15 s one of hers): song 44.0368-104.0367 s at
# the song's own speed (~/personal/saxo-video/songs/espresso/tt_rate.py: 29 log-spectrum pieces of 3 s, 0.6 ms
# residual), i.e. the main kit's 25.2371 s (main b43.744) to its end (b120), then 27.7 beats of verse 2 the main never
# had. TikTok muted the main post (itemMute), 2026-10-09 20:00; the post check's hide read back "Everyone", the run's
# retry found it "Only me".
# The hook (the barista dancing alone), the game pad, the cat awake, Sadi's complaint and conversion, the cat's call and
# the neighbours' fists all lie before the sound; the googly-eyed ring dance, the police car, the citation, the morning
# coffee, the bonnet charleston, the whole lakefront, the cat's storm-out, the switch, her dance on the counter and the
# dog asleep in her bed lie inside it, on their own bars. Verse 2 sings new words (a line-hash check of the LRC: none of
# verse 1's lines comes back) and would only follow the button, so the video stops where the main does, 76 beats after
# the sound's start (43.8464 s, 0.256 beats before verse 2's downbeat): the sound starts 0.256 beats before a downbeat
# too, so the loop keeps the beat (ending on the main's own last frame put a 0.15 s hiccup in it). The kit's grid starts
# on main beat 44 (the first downbeat inside the sound, at 0.1477 s), so tt beat = main beat - 44:
#   tt 0 s-b4        the ring dance (main b44: googly eyes all round, the neighbours dancing with their cups behind the
#                    two), 0.1477 s longer at its start: its clips set back by as much, so the dance stays on the music
#                    (hops, sways and swings follow the beat grid already)
#   tt b4-b73        the main's shots on their own bars (main b48-b117)
#   tt b73-end       the button (main b117, 2.74 beats of 3): the dog asleep in the cat's bed; the loop cuts to the ring
#                    dance, as the main's cut to its hook
# Built from episodes/2026-10-09-2.json (run make_2026-10-09-2.py first). Uploaded silent: the official sound is added
# in TikTok Studio. Every actor and map timing in these shots counts from the shot's start, so a moved shot keeps them.
import copy, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ID, MAIN = '2026-10-09-2-tt', '2026-10-09-2'
PER = 60 / 103.9993                                # a beat (the sound plays the song at its own speed)
KIT0 = 44.0368 - 18.7997                           # the sound's start in the main kit's time (s)
B0 = 44                                            # the first downbeat inside the sound (main beat)
DT0 = round(B0 * PER - KIT0, 4)                    # its tt time
END = round(76 * PER, 4)                           # the video: 76 beats from the sound's start
assert abs(DT0 - 0.1477) < 1e-4 and abs(END - 43.8464) < 1e-4, (DT0, END)
main = json.load(open(os.path.join(HERE, MAIN + '.json')))
M = {s['beat']: s for s in main['shots']}
T = lambda b: round(DT0 + b * PER, 3)              # tt beat -> tt seconds

def moved(mb):
    """main shot mb at tt beat mb - B0; its timings count from the shot's start, so they move with it"""
    s = copy.deepcopy(M[mb]); tb = mb - B0; s['beat'] = round(tb, 3)
    s['lyric'] = f"(tt {T(tb) if tb else 0} s, main beat {mb}) " + s.get('lyric', '')
    return s

# ---- the hook: the video starts 0.1477 s before the main's b44, so its clips start that much earlier ----
HOOK = moved(B0)
assert [(a['who'], a['clip'], a['at'], a.get('speed', 1)) for a in HOOK['actors']] == [
    ('saxo', 'charleston', 0.6, 1), ('sadi', 'happy_idle', 0.3, 0.25)], HOOK['actors']
for a in HOOK['actors']:
    a['at'] = round(a['at'] - DT0 * a.get('speed', 1), 4)
HOOK['lyric'] = HOOK['lyric'].replace(') ', f', {DT0} s longer at its start) ', 1)
shots = [HOOK] + [moved(mb) for mb in sorted(M) if mb > B0]

for sh in shots:
    assert not any(k2.startswith('word') for k2 in sh), sh['lyric']
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
beats = [s['beat'] for s in shots]
assert beats == sorted(beats) and len(set(beats)) == len(beats), 'shots out of order'
assert T(beats[-1]) < END - 0.8, 'the last shot is too short'
clips = {a['clip'] for s in shots for a in s['actors']}
ep = {**{k2: v for k2, v in main.items() if k2 not in ('shots', 'clips', 'song', 'n', 'yt', 'new', 'notes', 'logline')},
      'n': '2-tt',
      'song': {'title': 'Espresso', 'artist': 'Sabrina Carpenter', 'window': [44.0368, round(44.0368 + END, 4)], 'rate': 1,
               'bpm': 103.9993,
               'tiktok_sound': {'music_id': '7364498342501435408', 'title': 'Espresso', 'author': 'Sabrina Carpenter',
                                'seconds': 60, 'videos': 527734}},
      'logline': "3 a.m. on an Italian lakefront: everyone who comes to complain about Saxo's espresso bar gets an "
                 "espresso and googly eyes and joins the dance; Compote the cop rolls up in the clip's police car with a "
                 "citation and ends up kicking the charleston on its bonnet; the last one awake is Kob, who storms out "
                 "with her milk: he switches it for an espresso, the cat who never dances outdances them all on the "
                 "counter, and the dog sleeps in her bed.",
      'new': ["the TikTok cut is the main cut's last 76 beats on their own bars (the official sound starts 0.256 beats "
              "before main b44 and runs 16 s on into verse 2, whose new words would only follow the button), its first "
              "shot 0.15 s longer, the loop kept on the beat"],
      'notes': "TikTok muted the main post (itemMute, 2026-10-09). The official sound (Sabrina Carpenter's own, 527,734 "
               "videos, 60 s) is song 44.0368-104.0367 s at the song's own speed (29 log-spectrum pieces of 3 s, 0.6 ms "
               "residual), the main kit's 25.2371 s on (tt beat = main beat - 44). See the generator's header.",
      'clips': sorted(c for c in clips if c in set(main['clips'])), 'shots': shots}
ep['tags'] = {**main['tags'],
              'experiment': main['tags'].get('experiment', '') + " (TikTok cut on the 60 s official sound: the main's "
              "last 76 beats on their own bars)"}
out = os.path.join(HERE, ID + '.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots,', len(ep['clips']), 'clips (not in the main list:', sorted(clips - set(main['clips'])), ')')
starts = [T(s['beat']) if i else 0 for i, s in enumerate(shots)]
ends = starts[1:] + [END]
print('shot starts:', ','.join(map(str, starts)))
print('sheet times:', ','.join(str(round((a + b) / 2, 2)) for a, b in zip(starts, ends)))
print('first and last frames:', 0.0, round(END - 1 / 30, 3))
