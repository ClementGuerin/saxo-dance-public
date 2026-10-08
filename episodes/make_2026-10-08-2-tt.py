# make_2026-10-08-2-tt.py: writes episodes/2026-10-08-2-tt.json, the TikTok cut of "Poker Face" (Lady Gaga) on TikTok's
# official sound (Lady Gaga's own, music id 6917492138762569730, 60 s, 1,146,898 videos; first in the plain and the
# most-used searches): song 14.0003-74.0003 s at the song's own speed (~/personal/saxo-video/songs/poker-face/tt_rate.py:
# 29 log-spectrum pieces of 3 s, 0.7 ms residual), i.e. the main kit's -0.2077 to 59.7923 s (main b-0.41 to b118.59).
# TikTok muted the main post (itemMute), 2026-10-08 20:00; the post check's hide read back "Everyone", the run's retry
# found it "Only me".
# The sound is the main cut itself, starting 0.2077 s earlier and ending 7.06 s sooner: the hook, the intro chant,
# verse 1, the pre-chorus and the chorus are all inside it, but the post-chorus (the win, the reveal, the dance on the
# table, the victory kick into the pool, the dive) lies past its end, all but 2.59 beats. The kit's grid starts on main
# beat 0 (the first downbeat inside the sound, at 0.2077 s), so tt beat = main beat:
#   tt 0 s-b112      the main's shots (main b0-b112): the hook (his rise out of the pool, 0.2077 s longer at its start:
#                    its clip and its rise set back by as much, so the sway and the rise stay on the music; it opens on a
#                    splash round his head, the loop's landing), the deal, hand one (aces, his tell, everyone folds), hand
#                    two (junk, the sob, the cat takes it all), the sunglasses, the bluff, the cat's read, the standoff
#   tt b112-b115     the cat folds her aces (main b112, 3 beats of 4, on the showdown's lens, main b64: low behind her
#                    cards, her aces turn face up big in the foreground and slide away into the middle)
#   tt b115-b116.75  the win (main b116, 1.75 beats of 4): the pot slides to him at once and he rakes it in with both
#                    paws, the sunglasses fly off at once (caught in flight they read as a wire frame round his head),
#                    his tongue flops out
#   tt b116.75-end   the victory kick (main b124, 1.84 beats of 4, restaged): standing in the raked heap at the table's
#                    near edge, a charleston kick on the shot's first frame and one on its last, the pile bursting out
#                    from under the second, past the lens; the loop cuts as it flies to the hook's splash, his pool full
#                    of floating biscuits and him rising out of it with one across his jaws (the main's own loop: there
#                    the dive and his head popping up came between)
# Review loop 1 (a fresh reviewer, 4 of 7 stills, the loop failed; the critic 18/25: 3/4/3/4/4) restaged the fold, the
# win and the kick, and gave the hook its splash; loop 2 (5 of 6) restaged the kick again; loop 3 passed the sequence and
# 3 of 4 stills (the lamp off over the kick, the splash earlier; see each below).
# Built from episodes/2026-10-08-2.json (run make_2026-10-08-2.py first). Uploaded silent: the official sound is added
# in TikTok Studio. Every actor and map timing in these shots counts from the shot's start, so a moved shot keeps them.
import copy, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
from cam import view
ID, MAIN = '2026-10-08-2-tt', '2026-10-08-2'
PER = 60 / 118.9986                                # a beat (the sound plays the song at its own speed)
DT = 0.2077                                        # tt time - main kit time (song 14.208 - 14.0003)
END = 60.0                                         # the video: the whole sound
main = json.load(open(os.path.join(HERE, MAIN + '.json')))
M = {s['beat']: s for s in main['shots']}
T = lambda b: round(DT + b * PER, 3)               # tt beat -> tt seconds
END_B = (END - DT) / PER                           # 118.59
assert abs(END_B - 118.587) < 0.002, END_B

def moved(mb, tb, what=None):
    """main shot mb at tt beat tb; its timings count from the shot's start, so they move with it"""
    s = copy.deepcopy(M[mb]); s['beat'] = round(tb, 3)
    s['lyric'] = f"(tt {T(tb) if tb else 0} s, main beat {mb}) " + (what or s.get('lyric', ''))
    return s

def actor(s, who):
    return next(a for a in s['actors'] if a['who'] == who)

# ---- the hook: the video starts 0.2077 s before the main's first frame, so its clip and its rise start that much later
HOOK = moved(0, 0)
rider = actor(HOOK, 'saxo')
assert (rider['at'], rider['speed'], rider['myAt']) == (0.4, 0.3, 0.0), rider
rider['at'] = round(rider['at'] - DT * rider['speed'], 4)
rider['myAt'] = DT
HOOK['lyric'] = HOOK['lyric'].replace(') ', ', 0.2077 s longer at its start) ', 1)
# Review loop 1: the loop had no cause on screen (the kick looks away from the pool, and frame 1 opened on calm water),
# so frame 1 lands on a splash: a big one round his head and two smaller ones among the biscuits, each started a moment
# before the shot so the droplets are in the air on the first frame and settled by 0.8 s
assert 'splash' not in HOOK, HOOK
HOOK['splash'] = [[0.0, -3.23, -0.25, 1.2], [-0.95, -4.35, -0.04, 0.7], [0.9, -4.7, 0.06, 0.6]]   # at 1.5 the droplets rose 3 m over the windows: snow
# loop 3: started 0.12 s before the shot, two droplets sat on his brow like glitch tiles on frame 1; 0.25 s before, they are above his head
STORY = [HOOK] + [moved(mb, mb) for mb in sorted(M) if 0 < mb < 112]

# ---- the ending: the cat folds, the win, the kick, squeezed into b112 to the sound's end ----
# Review loop 1: over her shoulder (the main's S32) the cat was a white sleeve at the edge and her aces two small cards
# in a corner. The fold goes on the showdown's proven lens (main b64: low behind her cards, her chair gone, the lens at
# her eyes): her two aces turn face up big in the foreground, then slide away into the middle, face up; the dog in his
# sunglasses beyond gives nothing away
FOLD = moved(112, 112, "the cat folds, low behind her cards (the showdown's lens): her two aces turn face up big in the "
             "foreground and slide away into the middle; the dog in his sunglasses beyond gives nothing away")
LOW = M[64]; assert LOW['chairs'] == {'kob': False} and LOW['cam']['fov'] == 62, LOW
FOLD.update(cam=copy.deepcopy(LOW['cam']), focus=copy.deepcopy(LOW['focus']), chairs={'kob': False})
FOLD['actors'] = [a for a in FOLD['actors'] if a['who'] == 'saxo']
assert FOLD['actors'][0]['shades'] is True, FOLD['actors']
kc = FOLD['cards']['kob']; assert (kc['show'], kc['fold']) == (0.45, 1.05), kc
kc.update(r=0.6, show=0.15, fold=0.8)               # nearer the lens; face up by 0.45 s, slid in by 1.2 s ('nobody' b114.7)
FOLD['stacks'] = {}                                # her stack at the frame's edge read as a crate
WIN_B, KICK_B = 115.0, 116.75
WIN = moved(116, WIN_B, "the win, 1.75 beats of the main's 4: the mountain of biscuits slides to him at once and he rakes "
            "it in with both paws; the sunglasses fly off at once (gone by 0.5 s), his tongue flops out, he bounces in his chair")
assert WIN['rake'] == ['saxo', 0.05, 0.5] and actor(WIN, 'saxo')['shades'] == {'off': 0.35}, WIN
WIN['rake'] = ['saxo', 0.0, 0.45]
# Review loop 1: the tell's paws up by his cheeks, with his wide eyes and the bolt on his cheek, read as panic, not a
# win: both paws reach round the heap on the felt instead (S27's push), the tongue and the bounce kept
actor(WIN, 'saxo').update(shades={'off': 0.05}, arm='both', aim=[0.12, -0.3, 0.9], upAt=-1)
KICK = moved(124, KICK_B, "the victory kick, 1.84 beats of the main's 4: up on the table on the heap of biscuits, "
             "frontal from the pool side, his kick sends the whole pot flying straight at the lens; the loop cuts to "
             "a splash in the pool full of floating biscuits, him rising out of it with one across his jaws")
k0 = KICK['kick'][0]; dancer = actor(KICK, 'saxo')
assert abs(k0 - 1.311) < 1e-6 and dancer['at'] == 0.15 and dancer.get('speed', 1) == 1, (KICK['kick'], dancer)
K_AT = 0.74                                        # the kick 0.74 s in: the loop cuts 0.15 s later, the biscuits flying
                                                   # big at the lens (kicked at 0.36 s they had left the frame 0.2 s before
                                                   # the cut; at 0.6 s the last 4 frames were only huge brown bones)
# Review loop 1: kicked towards (-1.3, -4.4) the heap flew off the frame's right edge and its tail bunched into what
# read as a brown stick figure beside him: it flies along the line from the table through the lens now, and the
# cat's stack (a "crate" at the left) is gone
KICK['kick'] = [K_AT, 1.58, -3.9]
KICK['stacks'] = {}
dancer['at'] = round(dancer['at'] + k0 - K_AT, 3)  # the charleston's leg comes up on the kick, as in the main
# Review loop 2: the heap in front of his feet and the cat's chair right behind him made him read as still seated, his
# paw at his cheek between two kicks read as worry, the heap was back in the middle (the win had raked it to his edge),
# and the burst hid the kick. He stands IN the raked heap at the table's near edge now (the rim under his feet, the
# pile round his shins), every chair gone, the lens wider (2.7 m, from the pool side), the charleston's two kicks on
# the shot's first and last frames, the pile bursting out from under the second, flying past the lens on its left
K_AT = 0.7
KICK['kick'] = [K_AT, 2.6, -3.9]
KICK['rake'] = ['saxo', -1, 0.01]                  # raked to his edge already (onFelt 0.62 from the middle: z 2.38)
KICK['chairs'] = {'saxo': False, 'kob': False}
KICK['noLamp'] = True                              # loop 3: from this lens the lamp's shade sat on his crown like a cone hat
KICK['key'] = [0.0, 1.85, 3.0, 1.25, 1.05, 0.72]   # the lamp's own light (maps36.js pt 1), which noLamp also switches off
dancer.update(z=2.4, lift=0.64, at=0.707)          # feet 8 cm into the pile; charleston kicks at clip 0.7 and 1.6 s
KICK['cam'], KICK['focus'] = view((0.45, 1.35, -0.3), (0.0, 1.2, 2.4), 56, p1=(0.43, 1.33, -0.22), roll=[-4, -2], hand=0.3)
shots = STORY + [FOLD, WIN, KICK]

for sh in shots:
    assert not any(k2.startswith('word') for k2 in sh), sh['lyric']
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
beats = [s['beat'] for s in shots]
assert beats == sorted(beats) and len(set(beats)) == len(beats), 'shots out of order'
assert T(beats[-1]) < END - 0.8, 'the last shot is too short'
clips = {a['clip'] for s in shots for a in s['actors']}
ep = {**{k2: v for k2, v in main.items() if k2 not in ('shots', 'clips', 'song', 'n', 'yt', 'new', 'notes', 'logline')},
      'n': '2-tt',
      'song': {'title': 'Poker Face', 'artist': 'Lady Gaga', 'window': [14.0003, 74.0003], 'rate': 1, 'bpm': 118.9986,
               'tiktok_sound': {'music_id': '6917492138762569730', 'title': 'Poker Face', 'author': 'Lady Gaga',
                                'seconds': 60, 'videos': 1146898}},
      'logline': "A dog can't keep a poker face: at Saxo's poker night by his pool, every good hand sets his tongue "
                 "flopping and every bad one makes him sob, so the cat who never moves a whisker takes every pot; down "
                 "to his last stack he lets the 'deal with it' sunglasses drop onto his face, goes all in with a seven "
                 "and a two, and the cat folds her aces; he can't hold the win in, and his victory kick sends the whole "
                 "pot into the pool, where the video loops back to him rising out of it.",
      'new': ["the TikTok cut keeps the main's shots on their own bars (the official sound is the main cut itself, 0.21 s "
              "earlier and 7 s shorter) and squeezes the post-chorus's win and victory kick into its last 2.6 beats, "
              "so the kick loops into the hook's pool full of biscuits"],
      'notes': "TikTok muted the main post (itemMute, 2026-10-08). The official sound (Lady Gaga's own, 1,146,898 videos, "
               "60 s) is song 14.0003-74.0003 s at the song's own speed (29 log-spectrum pieces of 3 s, 0.7 ms "
               "residual), the main kit's -0.2077 to 59.7923 s (tt beat = main beat). See the generator's header.",
      'clips': sorted(c for c in clips if c in set(main['clips'])), 'shots': shots}
ep['tags'] = {**main['tags'],
              'experiment': main['tags'].get('experiment', '') + " (TikTok cut on the 60 s official sound: the main's "
              "shots on their own bars, the win and the kick squeezed into the last 2.6 beats)"}
out = os.path.join(HERE, ID + '.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots,', len(ep['clips']), 'clips (not in the main list:', sorted(clips - set(main['clips'])), ')')
print(f'fold {T(112)} s, win {T(WIN_B)} s, kick {T(KICK_B)}-{END} s ({END_B - KICK_B:.2f} beats; the kick at {T(KICK_B) + K_AT:.3f} s)')
starts = [T(s['beat']) if i else 0 for i, s in enumerate(shots)]
ends = starts[1:] + [END]
print('shot starts:', ','.join(map(str, starts)))
print('sheet times:', ','.join(str(round((a + b) / 2, 2)) for a, b in zip(starts, ends)))
