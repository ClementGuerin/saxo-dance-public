# make_2026-10-03-2-tt.py: writes episodes/2026-10-03-2-tt.json, the TikTok cut of "we fell in love in october" (girl
# in red) on TikTok's official sound (girl in red's own, music id 6711980022204205826, 42 s, 1,744,736 videos): song
# 25.351-68.087 s at the song's own speed, all before the main cut (song 105.24-181.40 s). TikTok muted the main post
# (itemMute), 2026-10-03.
# The sound is pre-chorus 1's last line, chorus 1 and post-chorus 1. Chorus 1 is the main's chorus 2, 160 beats
# earlier, and post-chorus 1 the main's final run, 224 beats earlier: the same words on the same beats
# (~/personal/saxo-video/songs/we-fell-in-love-in-october/tt_sections.py, tt_vocal_check.mjs). The kit's grid starts
# on song beat 56 (the first downbeat inside the sound, 0.5047 s), so tt beat = main beat + 12 on the chorus and main
# beat - 52 on the final run. What the sound has no room for (the creeping pile's half-time verse, the dusk and the
# giant pile's set-up, the maple's revenge) goes, except the ending, which opens the cut:
#   tt 0 s-b3     COLD OPEN on the payoff (main b160): dusk, the park keeper and Compote under the big maple, which
#                 drops every leaf it has on them 0.23 s in, a pile growing up to their chins
#   tt b3-b8      the dead stop's frame (main b164) held as a slow push: buried, deadpan, nobody moves
#   tt b8-b15     the hook's swoop onto Saxo dancing the charleston (main b0, 7 beats instead of 3)
#   tt b15-b42    unchanged (main b3-b30): the girl in red, 'fell', her laugh, the keeper, the run-up, 'fall', the head
#                 pop, 'stars'
#   tt b42-b44    the creeping pile has reached the bench: she lowers her book and looks down at it (main b40, 2 beats)
#   tt b44-b48    he bursts out of a pile at her feet with a red maple leaf; hearts (main b44, unchanged)
#   tt b48-end    unchanged (main b100-b143.5): the drop into the giant pile at dusk, the three heads and Compote's
#                 carrots, the keeper's deadpan in the carrot rain, the charleston, the sack, 'world', the hops, the
#                 sack race (cut at the sound's end, 3.5 of its 8 beats: its walk and the sack's slide scaled to keep
#                 the pace), which loops into the cold open: the two left standing get the maple's revenge
# Built from episodes/2026-10-03-2.json (run make_2026-10-03-2.py first). Uploaded silent: the official sound is added
# in TikTok Studio. Every actor and map timing in these shots counts from the shot's start, so a moved shot keeps them;
# the walks (mx/mz), the sack's slide and the pushes span the shot, so a shorter shot does them faster.
import copy, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ID, MAIN = '2026-10-03-2-tt', '2026-10-03-2'
PER = 60 / 129.9953                                # a beat (the sound plays the song at its own speed)
OFF = 0.5047                                       # tt beat 0 (song beat 56) in tt seconds
END = 42.736                                       # the sound's length (song 25.351-68.087 s)
CH, RUN = 12, -52                                  # tt beat = main beat + CH (chorus 1), + RUN (the final run)
main = json.load(open(os.path.join(HERE, MAIN + '.json')))
M = {s['beat']: s for s in main['shots']}
T = lambda b: round(OFF + b * PER, 3)              # tt beat -> tt seconds
END_B = (END - OFF) / PER                          # 91.497
assert abs(T(CH) - 6.043) < 0.002 and abs(T(48) - 22.659) < 0.002, (T(CH), T(48))

def moved(mb, tb, what=None):
    """main shot mb at tt beat tb; its timings count from the shot's start, so they move with it"""
    s = copy.deepcopy(M[mb]); s['beat'] = round(tb, 3)
    s['lyric'] = f"(tt {max(0, T(tb))} s, main beat {mb}) " + (what or s.get('lyric', ''))
    return s

def actor(s, who):
    return next(a for a in s['actors'] if a['who'] == who)

# the cold open: the main's ending, the maple's revenge, then its frame held while the pre-chorus plays out
dump = moved(160, -1, "COLD OPEN, the payoff first: dusk, the park keeper and Compote under the big maple; 0.23 s in, it "
                      "drops every leaf it has on the two of them at once, a pile growing up to their chins (main b160)")
assert dump['dump'][0] == 0.231, dump['dump']
hold = moved(164, 3, "buried to the chins, deadpan, nobody moves: the main's dead stop, held as a slow push to the pre-chorus "
                      "line's end (main b164)")
hold.pop('still')                                  # the music goes on here (the main's frame was its silence)
hold['cam'] = {**hold['cam'], 'r': [5.112, 4.75], 'h': [0.8, 0.8], 'ease': 'lin'}
for a in hold['actors']: a['speed'] = 0
# Review loop 1 (2026-10-04): a closer second deadpan (main b152's lens on the buried pair, b7-b12) was the third shot of
# one image, 4 s of nothing new where viewers swipe (the critic's weakest shot); the reviewer read a leaf at Kob's mouth as
# a cigarette. It went: the hold runs to b8, and the hook's swoop starts there, 7 beats instead of 3 (critic's fix)
HOOK_B = 8

# chorus 1 = the main's chorus 2, unchanged but for the hook's longer swoop
CHORUS = [moved(0, HOOK_B, "HOOK of the story (main b0, its swoop over 7 beats instead of 3): " + M[0]['lyric'])]
CHORUS += [moved(mb, mb + CH) for mb in (3, 4, 8, 12, 16, 19, 22, 26)]
# Her laugh (main b8) failed three review loops on stills (his body lying at the lens read as a lump; alone from the low
# lens her head thrown back read as looking at the sky; at eye height with a sway she read as standing still; the clap
# clip read as paws at the belly), so it falls back to the main's shot as it shipped (DAILY_ROUTINE "Fallback").
# The beat before the burst failed three loops too: the main's bench shot over her shoulder (b30: a dark lump in front,
# then the pile "jumped" to her feet), its creeping pile joined late (b34: her head over his eye), then b40's lens with
# the pile creeping in (the back of her head, a trunk into it). The fallback is the main's b40 as it shipped, its first
# 2 beats: the pile at her feet, she lowers her book and looks down at it; the burst follows
creep = moved(40, 30 + CH, "the pile of leaves with his head poking out has reached the bench; the girl in red lowers her "
                           "book and looks down at it (main b40, its first 2 beats)")
burst = moved(44, 44, "he bursts out of a pile at her feet, leaves flying, holding up a big red maple leaf for her; "
                      "she's charmed: hearts pop over her (main b44, unchanged)")
# post-chorus 1 = the main's final run, unchanged up to the sound's end
RUN_SHOTS = [moved(mb, mb + RUN) for mb in (100, 102, 106, 110, 116, 118, 120, 124, 132, 136, 140)]
# Review loop 1: her solo's gangnam horse stance read as "paws clasped at the belly: not dancing" (as on the bobsled,
# CLAUDE.md); the charleston's kick reads (his solo, their two-shots), so she kicks too, 0.15 s into the shot
solo = RUN_SHOTS[5]; s_ = actor(solo, 'sadi'); assert solo['beat'] == 118 + RUN and s_['clip'] == 'gangnam', solo
s_.update(clip='charleston', at=1.45)
# Review loop 2: no leaf rain read round the two in the leaf rain (leafAt alone spreads the fall over the park); leafR
# makes it a dense shower round them, like the solos' 0.16
pair = RUN_SHOTS[3]; assert pair['beat'] == 110 + RUN and 'leafR' not in pair, pair
pair['leafR'] = 0.25
# The drop (main b100) failed three loops on stills (two standing on an intact pile, the maple's trunk out of his head;
# a burst moved to 0.17 s still read as "about 8 leaves"): it stays as the main shipped it (DAILY_ROUTINE "Fallback")
race = RUN_SHOTS[-1]
k = (END_B - (140 + RUN)) / 8                      # the sack race keeps 3.5 of its 8 beats
# Review loop 1: scaled to keep the main's pace, the sack slid 0.59 m and ended against the keeper's rake ("they look
# together, not left behind"; the critic: "the sack barely moves"). It keeps the main's whole 1.35 m hop-off and push in
# the 3.5 beats left (its end framing is the main's last frame, which passed the gate)
for who in ('saxo', 'sadi'):
    a = actor(race, who); assert a['mx'] == 1.35 and 'moveAt' not in a, a
bag = race['bag']; assert bag['at'] == 0 and abs(bag['dur'] - 8 * PER) < 0.01, bag
bag['dur'] = round(bag['dur'] * k, 3)              # the slide over the shot's real length, like its riders' mx
race['lyric'] += (f" (cut at the sound's end, {k * 8:.2f} of its 8 beats: the whole hop-off in them; it loops into the "
                  "cold open)")

shots = [dump, hold] + CHORUS + [creep, burst] + RUN_SHOTS
for sh in shots:
    assert not any(k2.startswith('word') for k2 in sh), sh['lyric']
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
beats = [s['beat'] for s in shots]
assert beats == sorted(beats) and len(set(beats)) == len(beats), 'shots out of order'
assert T(beats[-1]) < END - 1, 'the last shot starts too late'
clips = {a['clip'] for s in shots for a in s['actors']}
ep = {**{k2: v for k2, v in main.items() if k2 not in ('shots', 'clips', 'song', 'n', 'yt', 'new', 'notes', 'logline')},
      'n': '2-tt',
      'song': {'title': 'we fell in love in october', 'artist': 'girl in red', 'window': [25.351, 68.087], 'rate': 1,
               'bpm': 129.9953,
               'tiktok_sound': {'music_id': '6711980022204205826', 'title': 'we fell in love in october',
                                'author': 'girl in red', 'seconds': 42, 'videos': 1744736}},
      'logline': "On a golden October afternoon Saxo falls for the girl in red, literally, into the park keeper's leaf "
                 "piles; at dusk the two dive into the giant pile where Compote hid her carrots, end up hopping off in "
                 "the keeper's garden sack, and the maple takes its revenge on the two left behind.",
      'new': ['the cut opens on the main\'s ending (the maple\'s revenge on the keeper and Compote) and loops back into '
              'it: the official sound is chorus 1 and post-chorus 1, which the main\'s chorus 2 and final run match '
              'word for word, so those shots move over and the half-time verse in between goes'],
      'notes': "TikTok muted the main post (itemMute, 2026-10-03). The official sound (girl in red's own, 1,744,736 "
               "videos, 42 s) is song 25.351-68.087 s at the song's own speed (20 log-spectrum pieces of 3 s, 0.8 ms "
               "residual): pre-chorus 1's last line, chorus 1 (= the main's chorus 2, tt beat = main beat + 12) and "
               "post-chorus 1 (= the main's final run, tt beat = main beat - 52). See the generator's header.",
      'clips': sorted(c for c in clips if c in set(main['clips'])), 'shots': shots}
ep['tags'] = {**main['tags'], 'hook': 'action',    # it opens on the leaf dump, not the dance (the critic)
              'experiment': main['tags'].get('experiment', '') + ' (TikTok cut on the 42 s official sound: the main\'s '
              'chorus and final run moved over, opened on the maple\'s revenge)'}
out = os.path.join(HERE, ID + '.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots,', len(ep['clips']), 'clips (not in the main list:', sorted(clips - set(main['clips'])), ')')
print(f'hook {T(CH)} s, burst {T(44)} s, drop {T(48)} s, race {T(88)}-{END} s ({k * 8:.2f} beats, mx {actor(race, "saxo")["mx"]}, '
      f'bag to {bag["to"]} over {bag["dur"]} s)')
starts = [T(s['beat']) if i else 0 for i, s in enumerate(shots)]
mids = [round((starts[i] + (starts[i + 1] if i + 1 < len(shots) else END)) / 2, 2) for i in range(len(shots))]
print('sheet times:', ','.join(map(str, mids)))
