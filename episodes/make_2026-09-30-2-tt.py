# make_2026-09-30-2-tt.py: writes episodes/2026-09-30-2-tt.json, the TikTok cut of "Self Aware" (Temper City) on TikTok's
# official sound (Temper City's own, music id 7600130441848687390, 29.86 s, 3,196,226 videos on 2026-09-30; its other two
# sounds are 29 s / 329k and 27 s / 8k, none 60 s): song 44.3861-74.2441 s at the song's own speed (onset xcorr, then
# 3 s waveform pieces every 2 s on one line, 0.0 ms residual; ~/personal/saxo-video/songs/self-aware/tt/xc.py), i.e. the
# main's kit time tt + 5.9135 s = main b15.885 to b96.5 (a beat is 0.37037 s; the kit's beat 0 at 0.0424 s is main beat
# 16). TikTok muted the main post (itemMute: copyrighted), 2026-09-30.
# The window is chorus 1 from its third line (K02-K11), and chorus 2 sings the same words 128 beats later (K19-K28 start
# 127.6-128.5 beats after K02-K11), so the cut is the main's chorus 2 from its fifth line on the same words (tt beat =
# main beat - 144), behind the hook and the fan two-shot:
#   tt b-0.12..8  K02: the main's HOOK (b0), the whole joke in one frame: he croons into the mirror, Sadi melts beside it
#   tt b8..16     K03: the main's b8, the fan two-shot: Sadi gazing at the frontman as he sings, hearts over her head
#   tt b16..24    K04: the main's b160, Kob on bass, her eyes sliding towards the drums
#   tt b24..32    K05: the main's b168, Compote gets up from the drums with a stick and marches for the mirror
#   tt b32..40    K06: the main's b176 (the mirror's point of view: he sings to us, Compote marches in behind him), her
#                 path moved 0.3 m to his side so his head doesn't cover her, the stick held straight up
#   tt b40..48    K07: restaged: the hook's own lens over his shoulder, his reflection crooning in the glass, and beside the
#                 mirror, where Sadi melted in the hook, Compote glares at him and raises the stick with both paws on the
#                 line's first word
#   tt b48..56    K08: the smash restaged side on from his left: she swings, the glass bursts on the line's first word (the
#                 swing's clip time at the burst kept from the main: 1.43 s), and his surprised look turns to the lens
#   tt b56..64    K09: the main's b200, colour floods in, he turns to Sadi at last
#   tt b64..72    K10: restaged from the main's b208: she has turned from him to her own hand mirror, gazing into it
#                 (hearts over her own head) while he sings to the back of her head
#   tt b72..80.5  K11: restaged from the main's b216, closer: the frontman shrugs to the lens in the middle, Compote with her
#                 stick by the broken mirror, Sadi on her amp in her mirror, to the sound's last frame (29.85 s)
# Two reviews on the way: the first cut kept chorus 1's shots to K07 and moved only the payoff (the smash had no cause,
# the reversal read as her falling for him); the second kept the main's chorus 2 frames, where the raise, the impact and
# the wide hid faces and the stick (his head over hers, the back of his head at the burst, him beside her ear).
# Built from episodes/2026-09-30-2.json (run make_2026-09-30-2.py first). Uploaded silent: the official sound is added by
# TikTok Studio. Every actor, trail and map timing (smash, mono, hearts, reveal) counts from the shot's start, so a moved
# shot keeps them. Restaged lenses were framed by projection first (the faces' screen x and y, the glass's edges).
import copy, json, math, os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from cam import view

P = 60 / 162
B0 = 0.0424
END = 29.85
SHIFT2 = 144                                       # chorus 2: tt beat = main beat - 144 (the same words)
T = lambda b: round(B0 + b * P, 3)                 # tt beat -> tt seconds
HERE = os.path.dirname(os.path.abspath(__file__))
main = json.load(open(os.path.join(HERE, '2026-09-30-2.json')))
M = {s['beat']: s for s in main['shots']}
GZ = 2.3                                           # the big mirror's glass plane (it faces -z, the mic)
SA = (-3.1, 1.2)                                   # Sadi's amp
yaw_to = lambda a, b: round(math.degrees(math.atan2(b[0] - a[0], b[1] - a[1])), 1)
STICK = {'hold': 'dstick', 'holdScale': 1.8}


def actor(shot, who):
    return next(a for a in shot['actors'] if a['who'] == who)


def reflect(a):
    """his reflection: a crowd of one Saxo at the mirrored spot, the same clip at the same offset (the main's reflect)"""
    c = {'who': 'saxo', 'look': a['look'], 'clip': a['clip'], 'at': a['at'], 'speed': a.get('speed', 1), 'n': 1, 'cols': 1,
         'dx': 0, 'dz': 0, 'jitter': 0, 'face': 'world', 'x0': a['x'], 'z0': round(2 * GZ - a['z'], 3),
         'yaw': round(180 - a['yaw'], 1), 'mx': a.get('mx', 0), 'mz': -a.get('mz', 0)}
    if a.get('sway'): c['sway'] = a['sway']
    return c


def moved(tb, mb, what=None):
    """main shot mb at tt beat tb (its timings count from the shot's start)"""
    s = copy.deepcopy(M[mb]); s['beat'] = tb
    s['lyric'] = f"(tt {T(tb)} s, main beat {mb}) " + (what or s.get('lyric', ''))
    return s


def march_in(tb):
    s = moved(tb, 176, "K06 (the main's b176, the mirror's point of view): he sings to us, eyes on his reflection... and behind him, "
                       "clear of his head, Compote marches in with her stick held straight up")
    c0 = (-0.3, -1.0); c1 = (-0.45, 0.55)          # ends 0.75 m to his side: 0.84 of the width, inside the bulb frame (0.55 m left her face behind his ear)
    actor(s, 'compote').update(x=c0[0], z=c0[1], mx=round(c1[0] - c0[0], 3), mz=round(c1[1] - c0[1], 3), yaw=yaw_to(c0, (-0.8, 1.6)),
                               arm='R', aim=[0.25, 0.95, 0.15], upAt=0.3, **STICK)
    return s


def raise_(tb):
    s = moved(tb, 184); s['lyric'] = (f"(tt {T(tb)} s, restaged from main beat 184) K07: the hook's lens over his shoulder: he croons "
                                      "to his reflection, oblivious, and beside the mirror Compote glares at him and raises the "
                                      "stick over her head with both paws on the line's first word")
    sx = {'who': 'saxo', 'look': 'frontman', 'clip': 'happy_idle', 'x': -1.2, 'z': 0.6, 'face': 'world', 'yaw': 0, 'at': 4.2,
          'speed': 0.5, 'sway': 8, 'fg': True}
    cp = (-0.45, 1.7)                              # beside the glass's +x edge: his reflection's face stays clear
    s['actors'] = [sx, {'who': 'compote', 'look': 'drummer', 'clip': 'happy_idle', 'x': cp[0], 'z': cp[1], 'face': 'world',
                        'yaw': yaw_to(cp, (sx['x'], sx['z'])), 'at': 0.5, 'speed': 0.3, 'arm': 'both', 'aim': [0.12, 0.97, -0.15],
                        'upAt': 0.7, **STICK}]
    cam, focus = view((-0.2, 1.8, -1.8), (-1.0, 1.0, 2.0), 52, p1=(-0.3, 1.7, -1.4))
    s.update(cam=cam, focus=focus, crowd=reflect(sx), stars=['compote'])
    return s


def smash(tb):
    """K08 over Compote's left shoulder, the glass face on: the stick (in her near paw) held high, then snapped forward into
    his crooning reflection's face as the glass bursts on the line's first word. A side-on version from his left had her
    bent double in the swing clip with the stick on her far side (it read as a headbutt) and a pole over his head; here
    the arm is procedural (up, then aim2 forward over 0.08 s), her body stays upright, and he is out of frame. Framed by
    a search over lenses clear of the drums, the mic and Kob's amp: his reflection's face 0.40 of the width, the stick's
    hit 0.39, her head 0.63, the glass 0.24-0.99"""
    s = moved(tb, 192); s['lyric'] = (f"(tt {T(tb)} s, restaged from main beat 192) K08: over Compote's shoulder, the mirror face on: "
                                      "his reflection croons, she brings the stick down into its face and the glass bursts into "
                                      "shards on the line's first word")
    sx = {'who': 'saxo', 'look': 'frontman', 'clip': 'happy_idle', 'x': -1.2, 'z': 0.6, 'face': 'world', 'yaw': 0, 'at': 4.2,
          'speed': 0.5, 'sway': 8}                                 # the raise shot's mark: the same reflection
    cp = (-0.95, 1.65)
    # the stick held over her left shoulder, on the lens's side (straight up, both paws hid in her head and the stick read
    # as a pole out of it), then snapped forward into the glass
    s['actors'] = [{'who': 'compote', 'look': 'drummer', 'clip': 'happy_idle', 'x': cp[0], 'z': cp[1], 'face': 'world', 'yaw': 0,
                    'at': 0.5, 'speed': 0.3, 'arm': 'L', 'aim': [0.55, 0.75, -0.3], 'upAt': -0.3, 'aim2': [0.1, 0.2, 0.97],
                    'aim2At': 0.47, 'holdL': 'dstick', 'holdScale': 1.8}]
    s['smash'] = 0.55                                              # 17.82 + 0.55 = 18.37 s: K08's first word at 18.377 s
    cam, focus = view((0.8, 1.4, 0.0), (-1.0, 1.2, 2.0), 62, p1=(0.7, 1.4, 0.1))
    # his reflection where this lens sees it through the glass (0.33-0.48 of the width, the stick's hit at 0.34): at the
    # mirrored spot it showed as a clipped sliver at the glass's edge, the case's side hiding the rest
    refl = dict(reflect(sx), x0=-1.5, z0=2.9, yaw=180)
    s.update(cam=cam, focus=focus, crowd=refl, noMic=True, stars=['compote'])
    return s


def reversal(tb):
    """K10 restaged from the main's b208: Sadi on her amp turned three-quarters away from the lens (yaw -30, 60 degrees to
    screen left) with the hand mirror held out in her gaze (a held prop faces the body's yaw: in profile it went edge-on and
    vanished, and facing the lens beside him she read as falling for him); he stands 0.8 m behind her right shoulder,
    singing to the back of her head; hearts over hers. Framed by projection: her head 0.46 of the width, the mirror 0.30,
    his head 0.76, both head tops under 0.4"""
    s = moved(tb, 208); s['lyric'] = (f"(tt {T(tb)} s, restaged from main beat 208) K10: in colour: he sings to her now... and she has "
                                      "turned from him to her own pink hand mirror, gazing into it, hearts over her own head, while "
                                      "he sings to the back of her head")
    sx = (-2.85, 0.42)
    actor(s, 'sadi').update(yaw=-30, aim=[0.2, 0.5, 0.8], holdScale=1.5)
    actor(s, 'saxo').update(x=sx[0], z=sx[1], yaw=yaw_to(sx, SA))
    cam, focus = view((-2.35, 1.2, 3.7), (-3.2, 1.0, 1.0), 56, p1=(-2.4, 1.18, 3.5))
    s.update(cam=cam, focus=focus, stars=['sadi', 'saxo'])
    return s


def wide(tb):
    s = moved(tb, 216); s['lyric'] = (f"(tt {T(tb)} s, restaged from main beat 216) K11: the wide in colour, closer: the frontman in the "
                                      "middle shrugs to us, Compote with her stick by the broken mirror, the shards on the gravel, "
                                      "and Sadi on her amp lost in her own mirror")
    cam_xz = (2.3, -2.6); sx = (-1.7, 1.4); cs = (-0.6, 1.85)   # framed: Compote 0.12, him 0.46, Sadi 0.74, her mirror 0.85
    actor(s, 'saxo').update(x=sx[0], z=sx[1], yaw=yaw_to(sx, cam_xz))
    sadi = actor(s, 'sadi'); sadi.pop('hold', None)   # the mirror in her left paw, on the far side: in her right it hid her face
    sadi.update(yaw=185, arm='L', holdL='handmirror', aim=[0.2, 0.5, 0.8], holdScale=1.5)
    actor(s, 'compote').update(x=cs[0], z=cs[1], yaw=yaw_to(cs, cam_xz))
    cam, focus = view((cam_xz[0], 3.1, cam_xz[1]), (-1.45, 0.7, 0.95), 54, p1=(2.18, 2.95, -2.47))
    s.update(cam=cam, focus=focus)
    return s


shots = [moved(-0.12, 0, "K02 HOOK (the main's b0): the whole joke in one frame, black and white: pushing in over the frontman's "
                         "shoulder, he croons into the bulb-lit mirror by the mountain road, his reflection crooning back, while "
                         "beside it Sadi melts, hearts"),
         moved(8, 8, "K03 (the main's b8, the watcher): the two of them in one frame: the fan gazing at the frontman as he "
                     "sings, hearts popping over her head"),
         moved(160 - SHIFT2, 160), moved(168 - SHIFT2, 168), march_in(176 - SHIFT2), raise_(184 - SHIFT2), smash(192 - SHIFT2),
         moved(200 - SHIFT2, 200), reversal(208 - SHIFT2), wide(216 - SHIFT2)]
assert [s['beat'] for s in shots][1:] == list(range(8, 80, 8)), 'a shot per line'
assert T(shots[0]['beat']) <= 0 < T(shots[1]['beat']), 'the video must open on the first shot'
for sh in shots:
    assert not any(k.startswith('word') for k in sh), sh['lyric']
# black and white until the colour shot, the mirror whole until the smash, broken after it
smash_i = next(i for i, s in enumerate(shots) if s.get('smash') is not None)
for i, s in enumerate(shots):
    assert (s.get('mono') is True) == (i <= smash_i), f'shot {i}: mono'
    assert bool(s.get('broken')) == (i > smash_i), f'shot {i}: broken'
clips = {a['clip'] for s in shots for a in s['actors']} | {s['crowd']['clip'] for s in shots if s.get('crowd')}
cast = sorted({a['who'] for s in shots for a in s['actors']})
assert cast == ['compote', 'kob', 'sadi', 'saxo'], cast
assert clips <= set(main['clips']), clips - set(main['clips'])
ep = {**{k: v for k, v in main.items() if k not in ('shots', 'clips', 'song', 'n', 'new', 'notes', 'logline')},
      'n': '2-tt',
      'song': {'title': 'Self Aware', 'artist': 'Temper City', 'window': [44.3861, 74.2441], 'rate': 1.0, 'bpm': 162,
               'tiktok_sound': {'music_id': '7600130441848687390', 'title': 'Self Aware', 'author': 'Temper City',
                                'seconds': 29.86, 'videos': 3196226}},
      'logline': main['logline'],
      'notes': "TikTok muted the main post (itemMute, 2026-09-30). The official sound (Temper City's own, 3.2M videos, 29.86 s) "
               "is song 44.3861-74.2441 s at the song's own speed: the main cut's chorus 1 from its third line (b15.9-b96.5). "
               "Chorus 2 sings the same words 128 beats later, so the cut is the main's hook and fan two-shot, then chorus 2 "
               "from its fifth line on the same words (Kob's glance, Compote's march), with the raise, the smash, the reversal "
               "and the wide restaged so the faces, the stick and her mirror read.",
      'clips': sorted(clips), 'shots': shots}
out = os.path.join(HERE, '2026-09-30-2-tt.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots; first', T(shots[0]['beat']), 's; last', T(shots[-1]['beat']), '-', END, 's; cast', ','.join(cast))
