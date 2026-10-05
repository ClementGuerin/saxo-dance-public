# make_2026-10-05-tt.py: writes episodes/2026-10-05-tt.json, the TikTok cut of "No Scrubs" (TLC) on TikTok's official
# sound (TLC's own, music id 7460679357998008336, 60 s, 154,445 videos): song 8.0052-68.0052 s at the song's own speed,
# the main kit's 0.1763-60.1763 s (main b0.27-b93.2). TikTok muted the main post (itemMute), 2026-10-05; Zernio had
# read it failed (its call timed out after TikTok took the post).
# The sound is the main cut's own first 60 s: the intro's last bar, verse 1, pre-chorus 1, chorus 1, verse 2 and half
# of pre-chorus 2, so the payoff (the girls take his ride, he takes their saucer) lies past it. Pre-chorus 2 and chorus
# 2 sing pre-chorus 1 and chorus 1 again 64 beats later (the main kit's lines: 10 of 12 the same words, the other two
# chorus lines with 'passenger' and 'ride' on the same beats), so the payoff's shots move 64 beats earlier, onto the
# same words, and the first act's chase (the howl at the ramp, the boulevard, the hydraulics, the snatch) goes. The
# kit's grid starts on main beat 4 (the first downbeat inside the sound, 2.4068 s), so tt beat = main beat - 4:
#   tt 0 s-b16    unchanged (main b0-b20): the hook (the trio dancing before the chrome NO, joined 0.1763 s in, its
#                 clips set on by as much), 'fine', Kob's deadpan in the pod, the scrub and his pal in the lowrider,
#                 the moth out of his wallet
#   tt b16-b20    unchanged (main b20-b24): the lowrider rolls in past the girls' saucer, him waving his phone
#                 ('number')
#   tt b20-b24    the three of them staring at him, unimpressed ('give'; main b32, 8 beats early: review loop 1)
#   tt b24-b60    the payoff, 64 beats earlier (main b92-b128): they want the ride, the strut, Compote's fist, the
#                 stars, the girls in his seat, the ride pulling away, Sadi's tongue in the wind ('passenger'), the
#                 whole ride ('ride'), the scrub alone, Kob out of the back, the hops, Sadi and Compote out of the side
#   tt b60-end    the button (main b128-b133.5): he turns to their empty saucer, runs up its ramp, and it lifts off
#                 with his head out of the hangar; the lift-off holds to the end of verse 2's first line (3.66 beats
#                 instead of 1.5), so the lift is stretched with it
# Built from episodes/2026-10-05.json (run make_2026-10-05.py first). Uploaded silent: the official sound is added in
# TikTok Studio. Every actor and map timing in these shots counts from the shot's start, so a moved shot keeps them.
import copy, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ID, MAIN = '2026-10-05-tt', '2026-10-05'
PER = 60 / 92.9114                                 # a beat (the sound plays the song at its own speed)
OFF = 2.4068                                       # tt beat 0 (main beat 4) in tt seconds
DT = 0.1763                                        # main kit time - tt time
END = 46.1                                         # the video: to the end of verse 2's first line
HEAD, PAYOFF = -4, -68                             # tt beat = main beat + HEAD (verse 1), + PAYOFF (main b92 on)
main = json.load(open(os.path.join(HERE, MAIN + '.json')))
M = {s['beat']: s for s in main['shots']}
T = lambda b: round(OFF + b * PER, 3)              # tt beat -> tt seconds
END_B = (END - OFF) / PER                          # 67.66
assert abs(T(0) - (4 * PER - DT)) < 0.001 and abs(T(132 + PAYOFF) - ((132 - 64) * PER - DT)) < 0.001

def moved(mb, tb, what=None):
    """main shot mb at tt beat tb; its timings count from the shot's start, so they move with it"""
    s = copy.deepcopy(M[mb]); s['beat'] = round(tb, 3)
    s['lyric'] = f"(tt {max(0, T(tb))} s, main beat {mb}) " + (what or s.get('lyric', ''))
    return s

def shift_clips(s, dt):
    """move every clip in shot s on by dt seconds (the clip time is at + (t - t0) x speed, wrapped)"""
    for a in s['actors']:
        assert isinstance(a.get('at'), (int, float)), a
        a['at'] = round(a['at'] + dt * a.get('speed', 1), 3)
        for k in ('bumps', 'myAt', 'moveAt', 'reveal', 'holdAt'):
            assert k not in a, f'{a["who"]} has a timed {k}'

def actor(s, who):
    return next(a for a in s['actors'] if a['who'] == who)

# the hook and verse 1, then the roll-up: the main's own bars
HOOK = moved(0, HEAD)
shift_clips(HOOK, DT)                              # the video starts 0.1763 s into it: the kicks stay on the beat
HOOK['lyric'] = HOOK['lyric'].replace(') ', ', joined 0.1763 s in) ', 1)
OPEN = [HOOK] + [moved(mb, mb + HEAD) for mb in (4, 8, 12, 16, 20)]
# Review loop 1 (2026-10-05): with the main's howl and back-turn gone, no frame showed the girls rejecting HIM before
# they eye the ride ("'not him' depends on the cuts"), and the girl group at its ramp (main b24) failed (a snout into a
# cheek, a nose cut by the edge). On 'give' the three stare at him, unimpressed (main b32, a still frontal trio from
# his side, the lens solver's), then look past him at the lowrider
STARE = moved(32, 20, "'give': the three of them, unimpressed, staring at the scrub (main b32, 8 beats early)")
OPEN.append(STARE)
# the payoff on pre-chorus 1 and chorus 1, the same words 64 beats earlier
PAY = [moved(mb, mb + PAYOFF) for mb in (92, 96, 100, 102, 104, 108, 112, 114.3, 116.7, 120, 124, 128, 130.3, 132)]
# The button runs from tt b64 to the video's end, 3.66 beats instead of the main's 1.5 (there it ended on the song's
# last hit and a silent beat; here verse 2's first line goes on): the saucer and its rider rise 5 m over 2.15 s
# instead of 3 m over 0.87 s, and the lens tilts up with them, linearly, to keep his head mid-frame under the line
lift = PAY[-1]; assert lift['beat'] == 132 + PAYOFF and lift['shipLift'] == [0.1, 0.87, 3], lift
rider = actor(lift, 'saxo'); assert (rider['my'], rider['myAt'], rider['myDur']) == (3, 0.1, 0.87), rider
RISE, RISE_DUR = 5, 2.15
lift['shipLift'] = [0.1, RISE_DUR, RISE]
rider.update(my=RISE, myDur=RISE_DUR)
assert lift['cam']['look'] == [3.4, 5.4], lift['cam']
lift['cam'] = {**lift['cam'], 'look': [3.4, 7.4], 'ease': 'lin'}
# Review loop 1: as the video's last image he was 7-9% of the frame's height, "a grey blob with a pink stripe" (the
# main held this frame for under a second): the lens pushes in as the saucer rises, from the main's wide on the
# landed saucer to his head out of the hangar
lift['cam'].update(r=[12.479, 10.5], fov=[60, 36])
# The critic (17/25, weakest the button): pushed in to fov 36 he was still 13% of the frame, his tongue a pink dot, and
# the lift-off no longer read. The wide holds while the saucer leaves the ground (its legs, the street), then the lens
# zooms to his head and tongue out of the white hangar: the match of Sadi's tongue in the wind, and white into the hook
lift['cam'].update(r=[12.479, 11.5, 10.5], fov=[60, 50, 18], look=[3.4, 4.8, 7.2])
lift['lyric'] += f' (held to the end, {END_B - lift["beat"]:.2f} beats: a {RISE} m lift over {RISE_DUR} s)'

shots = OPEN + PAY
for sh in shots:
    assert not any(k2.startswith('word') for k2 in sh), sh['lyric']
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
beats = [s['beat'] for s in shots]
assert beats == sorted(beats) and len(set(beats)) == len(beats), 'shots out of order'
assert T(beats[-1]) < END - 1, 'the last shot starts too late'
clips = {a['clip'] for s in shots for a in s['actors']}
ep = {**{k2: v for k2, v in main.items() if k2 not in ('shots', 'clips', 'song', 'n', 'yt', 'new', 'notes', 'logline')},
      'n': '1-tt',
      'song': {'title': 'No Scrubs', 'artist': 'TLC', 'window': [8.0052, 68.0052], 'rate': 1, 'bpm': 92.9114,
               'tiktok_sound': {'music_id': '7460679357998008336', 'title': 'No Scrubs', 'author': 'TLC',
                                'seconds': 60, 'videos': 154445}},
      'logline': "The girl group sings about scrubs and every line cuts to Saxo: a dog in a backwards cap riding in his "
                 "pal's lowrider, broke (a moth flies out of his wallet), waving his phone at their saucer; they want "
                 "the ride, not him, so they knock him out of his seat and cruise off in his place, tongues in the "
                 "wind, and he takes their spaceship.",
      'new': ['the TikTok cut keeps the main\'s hook and verse 1, then plays the payoff 64 beats early on pre-chorus 1 and '
              'chorus 1, which the main\'s pre-chorus 2 and chorus 2 sing again word for word: the official sound is the '
              'main cut\'s own first 60 s; the lift-off is stretched to end on verse 2\'s first line'],
      'notes': "TikTok muted the main post (itemMute, 2026-10-05; Zernio had read it failed: its call timed out after "
               "TikTok took the post). The official sound (TLC's own, 154,445 videos, 60 s) is song 8.0052-68.0052 s at "
               "the song's own speed (29 log-spectrum pieces of 3 s, 0.7 ms residual), the main kit's 0.1763-60.1763 s "
               "(tt beat = main beat - 4 on the hook and verse 1, main beat - 68 on the payoff). See the generator's "
               "header.",
      'clips': sorted(c for c in clips if c in set(main['clips'])), 'shots': shots}
ep['tags'] = {**main['tags'],
              'experiment': main['tags'].get('experiment', '') + ' (TikTok cut on the 60 s official sound: the main\'s '
              'hook and verse 1, then its payoff 64 beats early on the same words)'}
out = os.path.join(HERE, ID + '.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots,', len(ep['clips']), 'clips (not in the main list:', sorted(clips - set(main['clips'])), ')')
print(f'payoff from {T(24)} s, chorus {T(36)} s, button {T(lift["beat"])}-{END} s ({END_B - lift["beat"]:.2f} beats)')
starts = [T(s['beat']) if i else 0 for i, s in enumerate(shots)]
ends = starts[1:] + [END]
print('shot starts:', ','.join(map(str, starts)))
print('sheet times:', ','.join(str(round((a + b) / 2, 2)) for a, b in zip(starts, ends)))
