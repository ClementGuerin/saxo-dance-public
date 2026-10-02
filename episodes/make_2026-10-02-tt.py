# make_2026-10-02-tt.py: writes episodes/2026-10-02-tt.json, the TikTok cut of "Jamaican (Bam Bam)" (HUGEL & SOLTO) on
# TikTok's official sound (HUGEL & SOLTO (FR)'s own, music id 7566356377771591696, 60 s, 805,351 videos): song
# 96.0931-156.0931 s, the main cut from kit 13.3875 s (b27.22, the break's verse) to its end (tt L00-L37 = the main kit's
# K01-K38). TikTok muted the main post (itemMute), 2026-10-02.
# The sound sits inside the main cut (tt time = main kit time - 13.3875 s; tt beat b = main beat b + 28 on the same
# constant 122 BPM), so the main's shots from the sound system on move over beat for beat on the same words. What lies
# before the sound (the warm-up dance in the snow, the bathtub's reveal, the push and freezer training, the team photo)
# is left out, but for the bathtub's reveal at the START, which opens it (review loop 1); the story then runs in order,
# Kingston, then the Olympics.
#   tt 0-b3      COLD OPEN: the bathtub on skis at the START, Kob in it, Saxo and Sadi dancing (the main's b4, joined
#                0.383 s early: the first shot always starts at 0 s, so its clips are set back by as much)
#   tt b3-b6     the sound system on the beach, the three dancing in sync (the main's b28 from its 4th beat)
#   tt b6-b22    the locals come to see, four coconuts on four heads, the practice run along the beach in the bathtub
#   tt b22-b48   the Olympics at night: the start, the push, one jumps in per 'bam', the tip over the lip, the silent bar
#   tt b48-b112  the run: the crowd starts to dance and chants, the wall hits, the wreck, the four drop out of the sky
#   tt b112-end  they carry the bathtub over the finish line on their heads, Kob in it (the main's ending, held to 60 s)
# Built from episodes/2026-10-02.json (run make_2026-10-02.py first). Uploaded silent: the official sound is added in
# TikTok Studio. Every actor, pelt and map timing in these shots counts from the shot's start, so a moved shot keeps them;
# the cold open and the sound system are the shots whose clips move (shift_clips).
import copy, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ID, MAIN = '2026-10-02-tt', '2026-10-02'
SH = -28                                           # tt beat = main beat - 28
PER = 60 / 122.0
OFF = 0.3829                                       # tt beat 0 (main b28) in tt seconds
KIT0 = 13.3875                                     # the sound's start in main kit seconds
END = 60.0
main = json.load(open(os.path.join(HERE, MAIN + '.json')))
M = {s['beat']: s for s in main['shots']}
T = lambda b: round(OFF + b * PER, 3)              # tt beat -> tt seconds
assert abs(T(0) - (28 * PER - KIT0)) < 0.001, 'the grid and the window disagree'

def moved(mb):
    """main shot mb at tt beat mb + SH (its timings count from the shot's start, so they move with it)"""
    s = copy.deepcopy(M[mb]); s['beat'] = round(mb + SH, 3)
    s['lyric'] = f"(tt {T(s['beat'])} s, main beat {mb}) " + s.get('lyric', '')
    return s

TT = {b: moved(b) for b in sorted(M) if b >= 28}
DT = T(0)
COLD = 3                                           # the cold open's beats: the reveal to tt b3, then the sound system

def actor(s, who):
    return next(a for a in s['actors'] if a['who'] == who)

def shift_clips(s, dt):
    """move every clip in shot s on by dt seconds (the clip time is at + (t - t0) x speed, wrapped)"""
    for a in s['actors']:
        assert isinstance(a.get('at'), (int, float)), a
        a['at'] = round(a['at'] + dt * a.get('speed', 1), 3)
        for k in ('bumps', 'myAt', 'moveAt', 'reveal', 'holdAt'):
            assert k not in a, f'{a["who"]} has a timed {k}'
    for k in ('coconuts', 'hits', 'go', 'hops', 'flashAt', 'jolt', 'flip', 'stop'):
        assert k not in s, f'a shifted shot has a timed {k}'

# Review loop 1 (2026-10-02): opened on the sound system, the reviewer scored the hook 2 ("the joke isn't in the
# opening: the bathtub bobsled doesn't appear until 7.5 s"; a static wide, a third of it sand, the sign cut to KING), so
# the main's own cold open comes back: its bathtub reveal at the START (main b4: the clawfoot tub on skis painted JAM,
# Kob in it in her parka with her milk, Saxo and Sadi dancing beside it) over the verse's first 3 beats. It starts at tt
# 0, 0.383 s before tt b0, so its clips are set back by as much and the charleston kicks land on the beat where they
# did. The night START also turns the loop from the FINISH into a cycle (from the sunny beach it played as a restart).
reveal = copy.deepcopy(M[4]); reveal['beat'] = 0
shift_clips(reveal, -DT)
reveal['lyric'] = "(tt 0 s, main beat 4, joined 0.383 s early) COLD OPEN: " + reveal['lyric']
# the sound system follows on 'hear the sound' (main b31.5-33.4 = tt b3.5-5.4), from its 4th beat: clips moved on 3 beats
sound = TT[28]; sound['beat'] = COLD
shift_clips(sound, COLD * PER)
sound['lyric'] = f"(tt {T(COLD)} s, main beat 28 from its 4th beat) " + sound['lyric'].split(') ', 1)[1]
# Review loop 1: in the practice run Sadi's face slid behind Saxo's beanie as his seat dance swayed him 10 degrees on
# every beat (the lens search placed the riders at rest): he keeps his raised paws, without the sway
sx = actor(TT[42], 'saxo'); sx.pop('sway', None); sx.pop('swayEvery', None)
# Review loop 1: before the wreck, the side-on handheld lens cut Saxo's head at the left edge for the whole shot: the
# same lens, wider (fov 52 to 60: the frame 18% wider at the tub)
TT[132]['cam'] = {**TT[132]['cam'], 'fov': 60}
# Review loop 2: the finish is the loop frame here, and with the team walking 0.7 m at the lens while it pushed in, the
# tub's near end covered Compote's face and a ski Sadi's eyes from 58.6 s (at 57.6 s both showed): the lens backs away
# with them instead, 0.7 m along its own line, so their place in the frame holds to the last frame
fin = TT[144]['cam']
assert all(abs(a['mz'] + 0.7) < 1e-6 for a in TT[144]['actors']), 'the finish walk changed'
TT[144]['cam'] = {**fin, 'r': [fin['r'][0], round(fin['r'][0] + 0.7, 3)]}
shots = [reveal] + [TT[b] for b in sorted(TT)]
last = shots[-1]
assert last["beat"] == 116 and END - T(116) > 2.4, T(116)   # the finish holds 2.57 s (2.42 s in the main)

for sh in shots:
    assert not any(k.startswith('word') for k in sh), sh['lyric']
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
assert [s['beat'] for s in shots] == sorted(s['beat'] for s in shots), 'shots out of order'
clips = {a['clip'] for s in shots for a in s['actors']}
ep = {**{k: v for k, v in main.items() if k not in ('shots', 'clips', 'song', 'n', 'yt', 'new', 'notes', 'logline')},
      'n': '1-tt',
      'song': {'title': 'Jamaican (Bam Bam)', 'artist': 'HUGEL & SOLTO', 'window': [96.0931, 156.0931], 'rate': 1, 'bpm': 122.0,
               'tiktok_sound': {'music_id': '7566356377771591696', 'title': 'Jamaican (Bam Bam)', 'author': 'HUGEL & SOLTO (FR)', 'seconds': 60, 'videos': 805351}},
      'logline': "Four beach pets from Kingston dance at the sound system, take coconuts on the head and train in a bathtub on "
                 "skis; then they turn up at the Winter Olympics with it: it bangs a wall on every 'bam', the last one wrecks "
                 "it, and they carry it over the finish line on their heads with Kob still sitting in it.",
      'new': ['the main cut moved onto the official sound beat for beat (it sits inside it, from the break\'s verse to the '
              'end), told in order: the cold open and the flashback\'s start, before the sound, are left out'],
      'notes': "TikTok muted the main post (itemMute, 2026-10-02). The official sound (HUGEL & SOLTO (FR)'s own, 805,351 "
               "videos, 60 s) is song 96.0931-156.0931 s at the song's own speed: the main cut from kit 13.3875 s (b27.22) "
               "to its end. The main's shots from the sound system (b28) on move over beat for beat (tt beat = main beat - "
               "28); the sound system opens it, joined 0.383 s early (see the generator's header).",
      'clips': sorted(c for c in clips if c in set(main['clips'])), 'shots': shots}
ep['tags'] = {**main['tags'], 'experiment': main['tags']['experiment'] + ' (TikTok cut on the 60 s official sound: the main moved over beat for beat from the sound system, told in order)'}
out = os.path.join(HERE, ID + '.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots,', len(ep['clips']), 'clips (not in the main list:', sorted(clips - set(main['clips'])), ')')
print(f'cold open joined {DT} s early (clips at {[a["at"] for a in reveal["actors"]]}); the sound system from {T(COLD)} s '
      f'(clips at {[a["at"] for a in sound["actors"]]}); the Olympics from {T(22)} s; '
      f'the silent bar {T(44)}-{T(48)}; drop 2 {T(72)}; the finish {T(116)}-{END}')
starts = [T(s['beat']) if i else 0 for i, s in enumerate(shots)]
print('sheet times:', ','.join(str(round((starts[i] + (starts[i + 1] if i + 1 < len(shots) else END)) / 2, 2)) for i in range(len(shots))))
