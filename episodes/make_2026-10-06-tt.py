# make_2026-10-06-tt.py: writes episodes/2026-10-06-tt.json, the TikTok cut of "Golden" (HUNTR/X) on TikTok's official
# sound (HUNTR/X's own, music id 7515251957310539792, 60 s, 2,117,372 videos): song 14.0579-74.0579 s at the song's own
# speed (~/personal/saxo-video/songs/golden/tt_rate.py: 29 log-spectrum pieces of 3 s, 0.7 ms residual), the main
# kit's -8.0571 to 51.9429 s (main b-16.5 to b106.5). TikTok muted the main post (itemMute), 2026-10-06.
# The sound opens 16.5 beats before the main cut (1.2 s near silent, then the verse's groove under the intro's two
# lines) and stops 22.5 beats into the chorus, so the line-up's last three turns (Sadi's note, Kob's milk, the leader's
# howl, main b109-b149) lie past it. The chorus is one 16-beat phrase played four times (main b84, b100, b116, b132:
# tt_sections.py), so the payoff can't keep its own bars; it is split round the loop:
#   tt 0-b16      the cold open, the main's ending (b138-b149) on the intro: he leans back at the mic in the near
#                 silence (the main's lean-back, its whole motion in 1.22 s), THE HOWL as the music comes in (rings,
#                 the golden dome bursting), the whole arena howls until the power flickers and dies (Kob's plug
#                 shot, the main's b147, failed three review loops and fell back), blackout
#   tt b16-b100   the story on its own bars, unchanged (main b0-b84): the hook, the tennis ball, Compote takes his
#                 spot and the mic, her scream blows the speakers, Kob unmoved
#   tt b100-end   the chorus: the drop (main b84, 3.5 beats), then the line-up's next turns compressed onto the first
#                 phrase: Sadi steps up and sings, the front row faints in hearts, the spotlight finds Kob, she sips
#                 her milk through the note, the leader walks up and spits out the ball, filling his lungs: the loop
#                 goes back to the lean-back and the howl
# Built from episodes/2026-10-06.json (run make_2026-10-06.py first). Uploaded silent: the official sound is added in
# TikTok Studio. Every actor and map timing in these shots counts from the shot's start, so a moved shot keeps them;
# the map's `blow` and `confetti` are events of the story, so they are re-timed to where those events now happen.
import copy, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ID, MAIN = '2026-10-06-tt', '2026-10-06'
PER = 60 / 123                                     # a beat (the sound plays the song at its own speed)
OFF = 0.2483                                       # tt beat 0 (song beat 12 = main beat -16) in tt seconds
DT = 8.0571                                        # tt time - main kit time
END = 60.0                                         # the video: the whole sound
STORY = 16                                         # tt beat = main beat + 16 on the story's own bars
main = json.load(open(os.path.join(HERE, MAIN + '.json')))
M = {s['beat']: s for s in main['shots']}
T = lambda b: round(OFF + b * PER, 4)              # tt beat -> tt seconds
END_B = (END - OFF) / PER                          # 122.49
assert abs(T(STORY) - DT) < 0.005, T(STORY)        # main beat 0 sits 4 ms off the song's grid in the main kit

def moved(mb, tb, what=None):
    """main shot mb at tt beat tb; its timings count from the shot's start, so they move with it"""
    s = copy.deepcopy(M[mb]); s['beat'] = round(tb, 3)
    s['lyric'] = f"(tt {max(0, T(tb))} s, main beat {mb}) " + (what or s.get('lyric', ''))
    return s

def actor(s, who):
    return next(a for a in s['actors'] if a['who'] == who)

# the cold open: the main's ending (b138-b149) on the sound's intro, 16.5 beats
LEAN = moved(138, -0.509, "cold open, the near silence: he leans back at the mic for it, the full moon above him "
                          "(the main's lean-back, its whole motion in 1.22 s)")
rider = actor(LEAN, 'saxo'); assert (rider['at'], rider['speed']) == (0.35, 0.32), rider
rider['speed'] = round(0.32 * 4.3 * PER / T(2), 3)   # the main's clip span over 1.22 s: the same pose at the cut
HOWL = moved(142.3, 2, "THE HOWL as the music comes in: rings of sound rising, the golden dome bursting over the arena")
howler = actor(HOWL, 'saxo'); assert (howler['at'], howler['speed']) == (1.2, 0.1), howler
howler['speed'] = 0.065                            # 6 beats instead of 2.7: the clip stays in its howl (1.2-1.39 s)
ARENA = moved(145, 8, "the whole arena howls with him under the dome, until the power gives out: the lights flicker "
                      "and die (the howl blows the power, as Compote's scream blew the speakers)")
# Kob yanking the plug (the main's b147) failed three review loops here (side on: "a yellow block, prongs into her
# chest"; restaged at the power box, three-quarter: "a yellow block on a red pole"; near-frontal with a lit socket plate,
# a bolt sign and sparks: "an orange block with two white squares, as if plugging in"), so it fell back to the passed
# shots (DAILY_ROUTINE "Fallback"): the arena howl runs 6 beats and the blackout lands in it (the map's flicker, then
# dark under the dome's glow), the howl itself blowing the power
ARENA['blackout'] = round(T(14) - T(8) - 0.48, 3)
DARK = moved(148, 14, "blackout: the stage dead, every muzzle still pointing at the moon under the golden dome")
COLD = [LEAN, HOWL, ARENA, DARK]

# the story on its own bars: main b0-b84, the hook to Kob unmoved by Compote's scream
STORY_SHOTS = [moved(s['beat'], s['beat'] + STORY) for s in main['shots'] if s['beat'] < 84]
assert len(STORY_SHOTS) == 22, len(STORY_SHOTS)

# the chorus's first phrase: the drop, then the line-up's next turns, compressed (main beat positions)
T_BLOW = T(77.5 + STORY) + M[77.5]['blow']         # Compote's scream blows the speakers (main shot b77.5)
T_CONF = T(84 + STORY) + M[84]['confetti']         # the confetti cannons fire on the drop
LINEUP = [  # (main shot, main beat it now starts on)
    (84, 84),        # the drop: confetti, the trio dancing in it, the lens craning up out of the pit (3.5 beats)
    (109, 87.5),     # Sadi steps up to the mic; Compote, done, steps aside (2 beats)
    (112, 89.5),     # SADI'S HIGH NOTE, a paw on her heart (3.5 beats)
    (116, 93),       # the pit: pink hearts rising, the front row fainted (3 beats)
    (120, 96),       # the spotlight swings off the stage and finds Kob on her throne (2 beats)
    (124, 98),       # KOB'S TURN: she sips her milk through the note (3 beats)
    (129, 101),      # the leader walks up to the mic, the ball in his mouth (3 beats)
    (134, 104),      # he spits the ball out and fills his lungs (2.5 beats, to the sound's end): the loop
]
LINE = []
for mb, at in LINEUP:
    s = moved(mb, at + STORY)
    if mb != 84 and s.get('blow') is not None: s['blow'] = round(T_BLOW - T(at + STORY), 3)
    if mb != 84 and s.get('confetti') is not None: s['confetti'] = round(T_CONF - T(at + STORY), 3)
    LINE.append(s)
# Review loop 1: the pit's reaction read as "hearts and adoring fans", but its fainted front row didn't ("from this steep
# top-down the sprawled front row looks like arms-out figures behind the rail"): the swoon and the hearts carry it
SWOON = next(s for s in LINE if s['beat'] == 93 + STORY); assert SWOON['faint'] == -0.4, SWOON
del SWOON['faint']
SWOON['lyric'] = SWOON['lyric'].replace('the whole front row fainted flat on its back', 'the front rows swooning')
# a walk cut shorter covers its ground faster: its clip speeds up with it, or the feet slide
for s, (mb, at), nxt in zip(LINE, LINEUP, [a for _, a in LINEUP[1:]] + [END_B - STORY]):
    main_len = [b for b in sorted(M) if b > mb][0] - mb
    for a in s['actors']:
        if a.get('clip') == 'happy_walk' and ('mx' in a or 'mz' in a):
            a['speed'] = round(a.get('speed', 1) * main_len / (nxt - at), 3)

shots = COLD + STORY_SHOTS + LINE
for sh in shots:
    assert not any(k2.startswith('word') for k2 in sh), sh['lyric']
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
beats = [s['beat'] for s in shots]
assert beats == sorted(beats) and len(set(beats)) == len(beats), 'shots out of order'
assert T(beats[-1]) < END - 1, 'the last shot starts too late'
clips = {a['clip'] for s in shots for a in s['actors']}
ep = {**{k2: v for k2, v in main.items() if k2 not in ('shots', 'clips', 'song', 'n', 'yt', 'new', 'notes', 'logline')},
      'n': '1-tt',
      'song': {'title': 'Golden', 'artist': 'HUNTR/X', 'window': [14.0579, 74.0579], 'rate': 1, 'bpm': 123,
               'tiktok_sound': {'music_id': '7515251957310539792', 'title': 'Golden',
                                'author': 'HUNTR/X & EJAE & AUDREY NUNA & REI AMI & KPop Demon Hunters Cast',
                                'seconds': 60, 'videos': 2117372}},
      'logline': "At the GOLDEN premiere a dog idol leans back at the mic and HOWLS the high note at the moon, the "
                 "arena howls with him under a golden dome, and the power dies; how it got there: a "
                 "tennis ball, Compote stealing his spot and his mic, her scream blowing the speakers, Sadi's note "
                 "swooning the front row, Kob sipping her milk through hers, and the leader stepping up at last.",
      'new': ['the TikTok cut opens on the main\'s ending (the lean-back in the sound\'s near-silent first second, the '
              'howl as the music comes in, the arena howling until the power dies), keeps the story on its own bars, then squeezes the '
              'line-up\'s next turns onto the chorus\'s first phrase, ending as he fills his lungs: a loop into the howl'],
      'notes': "TikTok muted the main post (itemMute, 2026-10-06; the post check's hide read back 'Everyone', the run's "
               "retry found it 'Only me'). The official sound (HUNTR/X's own, 2,117,372 videos, 60 s) is song "
               "14.0579-74.0579 s at the song's own speed (29 log-spectrum pieces of 3 s, 0.7 ms residual), the main "
               "kit's -8.0571 to 51.9429 s (tt beat = main beat + 16 on the story; the payoff moved). See the "
               "generator's header.",
      'clips': sorted(c for c in clips if c in set(main['clips'])), 'shots': shots}
ep['tags'] = {**main['tags'],
              'experiment': main['tags'].get('experiment', '') + ' (TikTok cut on the 60 s official sound: the howl as a '
              'cold open, the story on its bars, the line-up compressed onto the chorus, looping into the howl)'}
out = os.path.join(HERE, ID + '.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots,', len(ep['clips']), 'clips (not in the main list:', sorted(clips - set(main['clips'])), ')')
starts = [T(s['beat']) if i else 0 for i, s in enumerate(shots)]
ends = starts[1:] + [END]
print('cold open to', T(STORY), 's; drop at', T(100), 's; line-up', ', '.join(f'{T(at + STORY)}' for _, at in LINEUP[1:]))
print('blow at', round(T_BLOW, 3), 's, confetti at', round(T_CONF, 3), 's')
print('shot starts:', ','.join(map(str, starts)))
print('sheet times:', ','.join(str(round((a + b) / 2, 2)) for a, b in zip(starts, ends)))
