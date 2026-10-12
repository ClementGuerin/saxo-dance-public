# make_2026-10-12-2-tt.py: writes episodes/2026-10-12-2-tt.json, the TikTok cut of "Everybody Wants To Rule The World"
# (Tears For Fears) on TikTok's official sound (Tears For Fears' own, music id 6927235393519618049, 60 s, 819,939 videos;
# the night's song pick had found it and placed it coarsely, ~/personal/saxo-video/songs/everybody-wants-to-rule-the-world/
# tt_align.py, its preview saved beside it): song 80.0170 + 1.000000 x tt (tt_rate.py there: 29 log-spectrum pieces of 3 s,
# 0.7 ms residual), i.e. the main kit's 55.43 s on (main b103.52 to the music's end at b132.9), then the bridge (six lines,
# never in the main kit: tt/make_lyrics_tt.py there times them) and the guitar solo's first 35.5 beats. TikTok muted the
# main post (itemMute), 2026-10-12 20:00; the post check set it to Only me.
# The sound is the main's ending plus 44 s the main never had, so the cut is the payoff first, then a flashback that
# loops back into it (the main's own cold open did the same in 8 beats):
#   tt 0 s-b30     the main's ending on its own bars (tt beat = main beat - 104): Sadi hops in beside the dog at the wheel
#                  ('help'), the engine roars ('freedom'), the open road ('pleasure'), Kob out of the diner, her car gone
#                  ('nothing ever lasts forever'), the sunset and the long highway (the title), the twist: back at the
#                  pump, out of fuel (main S21-S28; the first one 0.2568 s longer at its start, its clips set back by as
#                  much; S28 is no longer still: the bridge comes in under it)
#   tt b30-b48     a white flash, then earlier: Kob drives in with the dog (4 beats of the main's 8, the car rolling in
#                  twice as fast), she climbs out and walks off (4 of 8: half the walk at the same pace), the fake sleep,
#                  her deadpan at the pump (3 of 4), her shades off (3 of 4)
#   tt b48-b76     the creep lens to the bridge's words: 'right behind' her back the good boy in his own seat (S08), then
#                  in her seat (S09); she turns round (S11), he sits up, the good boy (S07, 4 of 8); her back again, he's
#                  in her seat bobbing, tongue out (S10 without the shades: a little further each time); her shades drop
#                  onto his nose on the title (S10, as in the main); she turns round again (S11)
#   tt b76-end     the solo: back in his own seat in her shades on 'world' (S12, as in the main), the pump dance (S13-S15),
#                  she strolls into the diner (S16), the honk (S17), Sadi melts (S18), Compote's glare (S19), at the wheel
#                  deciding (S20, 3.52 beats of its 8): the loop goes into Sadi hopping in, as the main's S20 went into S21
# Lost: the cold open (the payoff opens the cut) and the dog's tongue-out insert (main b92). The video is the sound's first
# 112 beats (59.9694 s), so the loop keeps the beat. Built from episodes/2026-10-12-2.json (run make_2026-10-12-2.py first).
# Uploaded silent: the official sound is added in TikTok Studio. Every actor and map timing in these shots counts from the
# shot's start, so a moved shot keeps them; what spans a shot (a walk, the car's roll, the push) is set where it's cut.
import copy, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ID, MAIN = '2026-10-12-2-tt', '2026-10-12-2'
PER = 60 / 112.0571                                # a beat (the sound plays at the song's own speed)
T0 = 0.2568                                        # tt time of tt beat 0 (song beat 149, main kit beat 104)
SHIFT = 104                                        # tt beat = main beat - 104 for the main's ending
END = 59.9694                                      # the video: the sound's first 112 beats
END_B = (END - T0) / PER
assert abs(END_B - 111.5203) < 0.002, END_B
main = json.load(open(os.path.join(HERE, MAIN + '.json')))
M = {s['beat']: s for s in main['shots']}
T = lambda b: round(T0 + b * PER, 3)               # tt beat -> tt seconds


def moved(mb, tb, what=None):
    """main shot mb at tt beat tb; its timings count from the shot's start"""
    s = copy.deepcopy(M[mb]); s['beat'] = round(tb, 3)
    s['lyric'] = f"(tt {max(T(tb), 0)} s, main beat {mb}) " + (what or s.get('lyric', ''))
    return s


def actor(s, who):
    return next(a for a in s['actors'] if a['who'] == who)


# ---- the payoff: the main's ending on its own bars ----
PAYOFF = [moved(mb, mb - SHIFT) for mb in (104, 108, 112, 116, 124, 128, 130)]
HOOK = PAYOFF[0]                                   # frame 1: Sadi hops in beside the dog at the wheel, in Kob's shades
assert [(a['who'], a['clip'], a['at'], a.get('speed', 1)) for a in HOOK['actors']] == [
    ('saxo', 'male_driving_a_car', 0.3, 0.4), ('sadi', 'sitting_talking', 0.05, 0)], HOOK['actors']
for a in HOOK['actors']:                           # the video starts 0.2568 s before the main's S21
    a['at'] = round(a['at'] - T0 * a.get('speed', 1), 4)
HOOK['hearts'] = [h[:3] + [round(h[3] + T0, 3)] + h[4:] for h in HOOK['hearts']]
HOOK['lyric'] = HOOK['lyric'].replace(') ', f', {T0} s longer at its start) ', 1)
TWIST = PAYOFF[-1]
assert TWIST.pop('still') is True and len(TWIST['actors']) == 3
TWIST['lyric'] += ' (the bridge comes in under it, so the beat bounce is back on)'

# ---- the flashback: earlier, at the gas station ----
FB = 30
ARRIVE = moved(8, FB, "a white flash: earlier: Kob drives the green roadster into the gas station, the dog beside her, "
               "tongue out; Compote beckons them in (4 beats of the main's 8: the car rolls in twice as fast)")
ARRIVE['flashAt'] = [0]
assert ARRIVE['car']['dur'] == 4.284 and ARRIVE['car']['lin'] and actor(ARRIVE, 'kob')['mx'] == actor(ARRIVE, 'saxo')['mx']
ARRIVE['car']['dur'] = round(4 * PER, 3)           # the riders' linear mx spans the shot, the car's roll now too
WALK = moved(16, FB + 4, "she climbs out and walks off along the car, her back to him (4 beats of 8: half the walk at the "
             "same pace)")
k = actor(WALK, 'kob')
assert (k['mx'], k['mz']) == (2.27, 0.05), (k['mx'], k['mz'])
k['mx'], k['mz'] = round(k['mx'] / 2, 3), round(k['mz'] / 2, 3)
SLEEP = moved(24, FB + 8)
DEADPAN = moved(28, FB + 12, "her deadpan from the pump, the nozzle in her paw: she doesn't buy it (3 beats of 4)")
SHADES_OFF = moved(32, FB + 15, "she takes her shades off and stares (3 beats of 4; they fly off 0.35 s in)")
assert actor(SHADES_OFF, 'kob')['shades'] == {'at': -1, 'off': 0.35}

# ---- the creep lens, to the bridge's words ----
BEHIND = moved(44, 48, "'right behind': she has turned her back on her car; right behind her the dog sits in his own seat, "
               "the good boy")
SEAT = moved(48, 52, "the same frame: she hasn't moved, and behind her the dog is in her seat, paws on the wheel")
TURN = moved(56, 56)
GOOD = moved(36, 60, "she looks: he sits bolt upright in his own seat, paws on his knees, the good boy (4 beats of 8)")
AGAIN = moved(52, 64, "the same frame: her back again, and he's in her seat again, bobbing at the wheel, tongue out (a "
              "little further each time)")
s = actor(AGAIN, 'saxo')
assert s['shades'] == 0 and s['tongue'] and s['hop'] == [0.03, 1], s
del s['shades']
DROP = moved(52, 68, "the title: the same frame: her shades drop onto his nose and he bobs at the wheel right behind her "
             "back (as on the main's first title line)")
TURN2 = moved(56, 72, "she turns round again and stares straight at him")
assert DROP['cam'] == SEAT['cam'] == BEHIND['cam'] == AGAIN['cam'] == TWIST['cam'], 'the creep is one lens'

# ---- the solo ----
WORLD = moved(60, 76, "'the world': he's back in his own seat on his best behaviour, still wearing her shades (as on the "
              "main's first title line)")
DANCE = [moved(64, 80, "the solo: the cat's secret: Kob and Compote do the clip's pump dance in sync beside the red pumps, "
                       "deadpan"), moved(68, 84), moved(72, 88)]
DINER, HONK, MELT, GLARE = moved(76, 92), moved(80, 96), moved(84, 100), moved(88, 104)
DECIDE = moved(96, 108, "side on at the wheel, paws on it, in her shades: where to? (3.52 beats of 8: the loop goes into Sadi "
               "hopping in beside him)")
assert DANCE[1]['actors'][0]['at'] != DANCE[0]['actors'][0]['at'], 'the dance continues across its three shots'

shots = PAYOFF + [ARRIVE, WALK, SLEEP, DEADPAN, SHADES_OFF, BEHIND, SEAT, TURN, GOOD, AGAIN, DROP, TURN2, WORLD] + DANCE + \
    [DINER, HONK, MELT, GLARE, DECIDE]
for sh in shots:
    assert not any(k2.startswith('word') for k2 in sh), sh['lyric']
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
beats = [s['beat'] for s in shots]
assert beats == sorted(beats) and len(set(beats)) == len(beats), 'shots out of order'
assert beats[len(PAYOFF)] == FB and T(beats[-1]) < END - 1.5, 'the last shot is too short'
clips = {a['clip'] for s in shots for a in s['actors']}
assert clips <= set(main['clips']), clips - set(main['clips'])
ep = {**{k2: v for k2, v in main.items() if k2 not in ('shots', 'clips', 'song', 'n', 'yt', 'new', 'notes', 'logline')},
      'n': '2-tt',
      'song': {'title': 'Everybody Wants To Rule The World', 'artist': 'Tears For Fears', 'window': [80.017, 140.017],
               'rate': 1.0, 'bpm': 112.0571,
               'tiktok_sound': {'music_id': '6927235393519618049', 'title': 'Everybody Wants To Rule The World',
                                'author': 'Tears For Fears', 'seconds': 60, 'videos': 819939}},
      'logline': "The dog drives off with Kob's green roadster and Sadi the waitress, and Kob comes out of the diner to an "
                 "empty pump; flash back: every time she turned her back on her car he was in her seat, a little further "
                 "each time, and every time she looked he was the good boy.",
      'new': ["the TikTok cut's sound is the main's last 16 s plus the bridge and the solo, which the main never had: the "
              "payoff on its own bars first, then a flashback that retells the gag to the bridge's words ('right behind', "
              "the title, 'world') and dances the solo, looping into the payoff; 112 beats, so the loop keeps the beat"],
      'notes': "TikTok muted the main post (itemMute, 2026-10-12 20:00). The official sound (Tears For Fears' own, 819,939 "
               "videos, 60 s) is song 80.0170 + 1.000000 x tt (29 log-spectrum pieces of 3 s, 0.7 ms residual), the main "
               "kit's 55.43 s on: refrain 2, the bridge and the solo. See the generator's header.",
      'clips': sorted(clips), 'shots': shots}
ep['tags'] = {**main['tags'],
              'experiment': main['tags'].get('experiment', '') + " (TikTok cut on the 60 s official sound: the payoff on its "
              "own bars, then a flashback of the main's shots on the bridge and the solo)"}
out = os.path.join(HERE, ID + '.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots,', len(ep['clips']), 'clips')
starts = [T(s['beat']) if i else 0 for i, s in enumerate(shots)]
ends = starts[1:] + [END]
print('shot starts:', ','.join(map(str, starts)))
print('sheet times:', ','.join(str(round((a + b) / 2, 2)) for a, b in zip(starts, ends)))
print('first and last frames:', 0.0, round(int(round(END * 30) - 1) / 30, 3))
