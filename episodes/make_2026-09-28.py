# make_2026-09-28.py: writes episodes/2026-09-28.json, "Love Me Not" (Olivia Dean's cover in BBC Radio 1's Live Lounge,
# 2025, 10M views), from the user's queue: "recreate this famous viral video: follow the video itself (its scenes, gags
# and choreography), not just its song". So this is the session, shot for shot, with our cast as the band: Saxo the
# soul singer at the mic in front of the red board (a dark curly wig, the butter-yellow quilted jacket, headphones),
# Compote glaring behind the drums in the glass booth, Sadi on the red electric guitar, Kob on the keys, a bass pet and
# a three-pet horn section. The video's own shots, in its order: the wide behind the drummer, the red guitar close,
# the singer against the board (hand on the heart, paws clasped), the horn player in the foreground with the singer
# far, the keys by the vase of white flowers, the singer's close-up with a paw on the mic, the drums close, the bass
# with the singer far, over the keys to the singer, the horns coming up on the chorus's second half, the raised paw.
# The only thing we add lives inside the video's keys shots: the white flowers are daisies, and Kob, unimpressed at the
# keys, plucks them all through the song (love me, love me not); the song stops dead on verse 2's downbeat and she
# holds up the bare stem, deadpan.
# Beats count from B0 = 0.135 s at 119.202 BPM (cut time = B0 + b * 0.503347 s; a bar = 4 beats = 2.013 s); the cut is
# 0-66.73 s of the session (episodes/2026-09-28.config.js), then 0.57 s of silence. Lyric lines are named by number
# (L00-L13, episodes/2026-09-28.lyrics.js): the lyrics stay in their files. The intro b0-b19 (a drum fill b0-b4, then
# the groove), verse 1 b19-b66 (L00-L05, two bars a line, each sung from a pickup), chorus 1a b66-b98 (L06-L09),
# chorus 1b b98-b132 (L10-L13), the choked hit on verse 2's downbeat b132 (66.577 s), silence to 67.3 s.
# Action words (whitelisted tags, kit seconds): L02 come 21.06, L03 hold 24.20, L04 leave 28.40, L06 see 35.42, L07
# leave 39.54, L08 time 43.00, L09 need 47.56 come 49.32, L10 see 51.67, L11 leave 55.64, L12 time 59.12, L13 need
# 63.68 come 65.16. The session's own gestures sit on them: the hand on the heart and the clasped paws in verse 1, the
# paw on the mic, the raised paw, the beckon on "come".
import json, math, os, sys
sys.path.insert(0, os.path.dirname(__file__))
from cam import view, deadpan

P, B0 = 60 / 119.202, 0.135
T = lambda b: round(B0 + b * P, 3)                 # beat -> cut seconds
S = lambda b: round(b * P, 3)                      # beats -> seconds into a shot
END = 67.3                                         # the choked hit on verse 2's downbeat (b132), then silence
LOOK = {'saxo': 'soul', 'sadi': 'sadi', 'kob': 'kob', 'compote': 'compote'}
# ---- the studio (src/maps14.js STUDIO) ----
MIC = (0.0, 0.0)                                   # the singer faces +z, the red board behind him (z -1.3)
DRUMMER = (-2.78, 0.9)                             # Compote on her stool, facing +x across her kit
GUITAR = (-1.35, 2.3)                              # Sadi and the red guitar
KOB = (2.8, 0.95)                                  # Kob behind the keyboard (x 2.46), facing -x

def A(who, clip, x, z, **o):
    return {'who': who, 'look': o.pop('look', LOOK[who]), 'clip': clip, 'x': round(x, 3), 'z': round(z, 3), 'phones': True, **o}
def sax(clip='talking', **o):                        # the singer at the mic, facing it, grooving a little
    return A('saxo', clip, *MIC, face='world', yaw=0, at=o.pop('at', 'auto'), sway=o.pop('sway', 4), **o)
def compote(**o):                                    # the drummer: seated, both sticks, hitting on alternate beats
    return A('compote', 'male_driving_a_car', *DRUMMER, face='world', yaw=90, at=0, speed=0.3, hold='dstick', holdL='dstick', arm='both', aim='drums', upAt=0.0, **o)
def sadi(**o):                                       # the red guitar, turned a little towards the stage
    return A('sadi', 'playing_a_guitar', *GUITAR, face='world', yaw=o.pop('yaw', 20), at='auto', hold='guitar', holdScale=1.2, sway=o.pop('sway', 3), **o)
def kob(**o):                                        # the keys: both paws tapping, bored (or an arm of her own: the daisy)
    arms = {} if 'arm' in o else {'arm': 'both', 'aim': 'keys', 'upAt': 0.0}
    return A('kob', o.pop('clip', 'bored_idle'), *KOB, face='world', yaw=-90, at=o.pop('at', 0.3), speed=o.pop('speed', 0.5), **arms, **o)
# Saxo's gestures are whole-body clips, not arm aims: an aim far from the clip's pose tears the puffy jacket's sleeve
# into a flat fin and a raised arm reads as the rig's pose (review loop 1); only a small forward aim of his left paw holds.
HEART = dict(arm='L', aim='heart')                     # his left paw folded in to his left chest: on his heart (a straight forward aim read as pointing)
BECKON = dict(arm='R', aim='maneki')                   # "come": the paw curling in on the beat
DAISY = dict(holdL='daisy', arm='L', aim=[0.18, 0.05, 0.98], upAt=0.0)   # a daisy held at her chest, its head under her chin (higher it sat on the headphones' band or hid her eye), where the pluck reaches
PLUCK = dict(armB='R', aimB='pluck', pluckEvery=1)     # the right paw reaches across on every beat and a petal comes off
def shot(beat, actors, lyric, v, **o):
    c, focus = v
    return {'beat': beat, 'kind': 'dance', 'map': 'studio', 'actors': actors, 'lyric': lyric, 'cam': c, 'focus': focus, **o}
def along(p, ang, d, y):                             # a point d m from (x, z) p in the direction ang (deg, 0 = +z, 90 = +x)
    a = math.radians(ang); return (p[0] + math.sin(a) * d, y, p[1] + math.cos(a) * d)

# ---- cameras ----
def singer_mid(dx=-0.1, d=4.4, fov=44, push=0.5, lx=-0.45, roll=(-2, 1)):   # the singer against the board, off-centre: the board's whole text beside his head
    return view((dx, 0.9, d), (lx, 0.8, 0.0), fov, p1=(dx, 0.89, d - push), roll=list(roll), hand=0.25)
def singer_close(dx=0.45, d=2.4, fov=44, push=0.2):
    return view((dx, 0.97, d), (-0.04, 0.9, 0.0), fov, p1=(dx * 0.9, 0.93, d - push), roll=[-2, 2], hand=0.3)

HORN_KEY = [3.3, 2.0, 0.4, 0.95, 0.75, 0.5]           # a warm light on the horn section (the blue studio left them dark)
shots = [
  # ================= the intro: the drum fill, the band kicks in (b0-b18) =================
  shot(0, [sax(clip='happy_idle', sway=5)],
       "HOOK (the drum fill b0-b4): the session's own image: Saxo the soul singer at the mic in front of the glowing red board (RADIO, LIVE LOUNGE), curly wig, butter-yellow jacket, headphones, grooving to the drums before his first line; a push-in",
       singer_mid(dx=0.05, d=5.0, push=0.6, lx=-0.3, roll=(-4, 0)), petals=36, stars=['saxo']),
  shot(4, [compote()],
       "the fill lands: Compote behind her kit in the glass booth, glaring into the lens, sticks flying (the session opens on its drummer)",
       view((-0.7, 0.62, 1.02), (-2.78, 0.72, 0.9), 50, p1=(-1.05, 0.6, 0.98), roll=[-6, -3], hand=0.4), petals=36, stars=['compote']),
  shot(8, [sadi()],
       "the red guitar: Sadi grooving on her red electric guitar, the riff, a low push-in with a dutch tilt (the session's guitar close-up)",
       view(along(GUITAR, 20, 2.9, 0.42), (GUITAR[0], 0.5, GUITAR[1]), 54, p1=along(GUITAR, 20, 2.4, 0.4), roll=[-7, -4], hand=0.3), petals=36, stars=['sadi']),
  # ================= verse 1: the singer at the mic (L00-L05) =================
  shot(18, [sax()],
       "L00-L01: the singer at the mic, headphones on, the red board beside him: Saxo in the curly wig and the butter-yellow jacket, singing and gesturing (the session's medium shot)",
       singer_mid(), petals=36, stars=['saxo']),
  shot(30, [compote()],
       "L01: Compote and her whole kit, frontal: drumming with a glare",
       view((-0.45, 0.95, 1.35), (-2.72, 0.66, 0.9), 54, p1=(-0.55, 0.93, 1.33), roll=[5, 2], hand=0.5), petals=36, stars=['compote']),
  shot(34, [sax()],
       "L02 ('come' 21.06): a dolly-in on the singer from his right, singing into the mic (fallback after 3 review loops: a paw on the heart never read, the puffy sleeve fins or the grey paw on grey fur)",
       view((-1.1, 0.74, 2.8), (0.0, 0.8, 0.0), 50, p1=(-0.95, 0.74, 2.4), roll=[-5, -3], hand=0.3), petals=36, stars=['saxo']),
  shot(42, [sax(clip='happy_idle', sway=3, arm='both', aim='heart', upAt=S(3.5))],
       "L03 ('hold' 24.20): three-quarter from his left, closer: on 'hold' both paws fold to his chest, holding it (the session's heartfelt hands)",
       view((1.25, 0.92, 2.35), (-0.02, 0.8, 0.0), 46, p1=(1.05, 0.9, 1.98), roll=[3, 1], hand=0.3), petals=36, stars=['saxo']),
  shot(50, [sadi(yaw=-25), sax(), kob()],
       "L04 ('leave' 28.40): the session's side wide, from above: Sadi and the red guitar in the foreground, the singer at the board, Kob at the keys beyond",
       view((-4.2, 1.9, 4.0), (-0.3, 0.6, 1.2), 58, p1=(-4.0, 1.85, 3.85), roll=[0, 1], hand=0.3), petals=36, stars=['saxo']),
  shot(58, [sadi(yaw=10, sway=6), sax()],
       "L05: from the front of the stage: Sadi on the red guitar in the foreground, the singer beyond her at the board (the session's shots past a player to the singer)",
       view((-1.1, 0.9, 5.4), (-0.86, 0.75, 1.41), 58, p1=(-1.05, 0.88, 5.0), roll=[-3, 0], hand=0.3), petals=36, stars=['saxo']),
  # ================= chorus 1a (L06-L09) =================
  shot(66, [kob(petalsLeft=12, **DAISY, **PLUCK)],
       "L06 ('see' 35.42): the keys and the vase of daisies (the session's keys by the white flowers): Kob isn't playing, she's plucking a daisy, one petal on every beat, onto the keys (love me, love me not), deadpan; the pile grows",
       view((0.6, 1.3, 2.2), (2.65, 0.67, 1.05), 50, p1=(0.72, 1.28, 2.12), roll=[-3, 0], hand=0.25), petals=24, pile=[6, 1], stars=['kob']),
  shot(74, [sax()],
       "L07 ('leave' 39.54): the singer's close-up at the mic (the session's close-up)",
       singer_close(), petals=24, stars=['saxo']),
  shot(82, [compote()],
       "L08 ('time' 43.00): Compote behind her kit, frontal, glaring and drumming (fallback after 3 review loops: from her side or above, a stick crossed her face or no hit read)",
       view((-0.8, 0.66, 1.05), (-2.78, 0.72, 0.9), 50, p1=(-1.1, 0.64, 1.0), roll=[5, 2], hand=0.4), petals=24, stars=['compote']),
  shot(86, [sax(), sadi(yaw=5)],
       "L08-L09: the session from the front: the singer at the board, Sadi on the red guitar beside him",
       view((-0.5, 1.2, 6.6), (-0.81, 0.72, 1.61), 56, p1=(-0.48, 1.16, 6.1), roll=[0, 2], hand=0.3), petals=24, stars=['saxo']),
  shot(92, [sax()],
       "L09 ('need' 47.56, 'come' 49.32): a dolly-in on the singer from his left, singing into the mic",
       view((1.15, 0.78, 2.9), (0.0, 0.82, 0.0), 50, p1=(0.98, 0.78, 2.5), roll=[5, 3], hand=0.3), petals=24, stars=['saxo']),
  # ================= chorus 1b (L10-L13) =================
  shot(98, [kob(petalsLeft=5, **DAISY, **PLUCK)],
       "L10: the keys again, a beat: Kob, deadpan, plucks another petal off a half-bare daisy",
       deadpan(KOB, 0.78, 2.45, ang=-90, fov=48), petals=20, pile=16, stars=['kob']),
  shot(100, [sax()],
       "L10 ('see' 51.67): the singer from his right, low, the red board behind him",
       view((-1.0, 0.55, 2.45), (0.0, 0.84, 0.0), 50, p1=(-0.88, 0.55, 2.12), roll=[-6, -3], hand=0.3), petals=20, pile=18, stars=['saxo']),
  shot(106, [sadi(yaw=25, sway=6)],
       "L11 ('leave' 55.64): Sadi's close-up, grooving on the red guitar, eyes on the singer (the session's guitarist)",
       view(along(GUITAR, 38, 2.35, 0.72), (GUITAR[0] + 0.18, 0.62, GUITAR[1] + 0.05), 50, p1=along(GUITAR, 38, 2.05, 0.7), roll=[4, 2], hand=0.35), petals=20, pile=18, stars=['sadi']),
  shot(112, [],
       "L11-L12: the horn section comes up: trombone, sax and trumpet rise to their lips and blow",
       view((1.0, 1.1, 1.3), (3.95, 0.8, -1.2), 58, p1=(1.12, 1.08, 1.18), roll=[4, 1], hand=0.3), key=HORN_KEY, blossom=False, horns=0.15, petals=20, pile=18),
  shot(116, [sax()],
       "L12 ('time' 59.12): the singer's close-up from his right, singing",
       view((-0.75, 0.94, 2.3), (0.0, 0.9, 0.0), 44, p1=(-0.69, 0.93, 2.12), roll=[2, -1], hand=0.3), horns=True, petals=20, pile=18, stars=['saxo']),
  shot(120, [sadi(yaw=-25), sax(), kob()],
       "L12: the band from above, in full flight: Sadi and the red guitar in the foreground, the singer at the board, Kob at the keys beyond (fallback after 3 review loops: the side wide that passed)",
       view((-4.2, 1.9, 4.0), (-0.3, 0.6, 1.2), 58, p1=(-4.05, 1.86, 3.88), roll=[1, 0], hand=0.3), horns=True, petals=20, pile=18, stars=['saxo']),
  shot(124, [kob(petalsLeft=4, **DAISY, **PLUCK)],
       "L13 ('need' 63.68): Kob from her left, still plucking on the beat: her daisy down to its last petal, the keys white with petals",
       view((1.1, 0.68, 2.1), (2.8, 0.8, 0.95), 50, p1=(1.2, 0.68, 2.02), roll=[5, 2], hand=0.3), horns=True, noguests=True, petals=12, pile=[18, 1], stars=['kob']),
  shot(128, [sax()],
       "L13 ('come' 65.16): the singer against the board, the last line of the chorus",
       singer_mid(dx=-0.1, d=4.2, push=0.4, lx=-0.3), horns=True, petals=12, pile=22, stars=['saxo']),
  # ================= the button: the music stops dead on verse 2's downbeat =================
  shot(132, [kob(petalsLeft=1, petalFall=0.1, speed=0.0, armB='R', aimB='pluck', **DAISY)],
       "BUTTON (the choked hit, then silence): on the stop Kob plucks the daisy's last petal and it flutters down; she stares into the lens: love me... not",
       deadpan(KOB, 0.72, 2.45, cam_y=0.92, ang=-90, fov=44, push=0.05), still=True, stop=0.0, petals=12, pile=24, stars=['kob']),
]

clips = {a['clip'] for s in shots for a in s['actors']}
BASE = {'tpose', 'gangnam', 'twist', 'macarena', 'silly_twist', 'chicken', 'twerk', 'ymca', 'robot', 'shopping_cart', 'running_man', 'moonwalk', 'shuffle', 'tut', 'booty_step', 'arm_wave', 'snake', 'shimmy', 'charleston', 'samba', 'belly', 'northern_soul_spin',
        'skate_push', 'skate_idle', 'uppercut_atk', 'uppercut_vic', 'slam_atk', 'slam_vic'}
ep = {
  'date': '2026-09-28', 'n': 1,
  'song': {'title': 'Love Me Not', 'artist': 'Olivia Dean', 'window': [0.0, 66.73], 'bpm': 119.202},
  'logline': "Saxo's Live Lounge: the famous session recreated shot for shot with the gang as the band (Saxo the soul "
             "singer in the curly wig and the butter-yellow jacket at the mic, Compote glaring behind the drums, Sadi "
             "on the red guitar, Kob on the keys), and Kob, unimpressed, plucks every daisy in the vase on her "
             "keyboard through the song: when it stops dead she holds up the bare stem. Love me not.",
  'new': ['studio map (a radio live-session studio at night: the red board with our "RADIO" paw badge and "LIVE '
          'LOUNGE", the mic stand at the singer\'s muzzle, the drum booth round a chibi-sized kit, a keyboard on an '
          'X-stand with a vase of daisies whose petals come off shot by shot, amps, a horn section and a bass player '
          'in headphones, white blossom, plants, slanted blue neon; flags horns, petals, pile, stop, noRide, noCrash, '
          'noMic, blossom, key, clear)',
          'actor fields phones (studio headphones: two cups and a band over the crown, in the head bone\'s frame), '
          'armB + aimB (the other arm\'s own aim or swing: one paw holds the daisy while the other plucks), '
          'petalsLeft, pluckEvery (a held daisy loses a petal on every beat, each fluttering down) and petalFall; '
          'props guitar (the red electric guitar laid between both paws, its body in front of the belly), dstick '
          '(drumsticks), daisy; swings keys (paws tapping the keys), pluck (the right paw reaching across to the '
          'daisy on the beat), heart (the forearm folded in to the chest, held) and drums (a drum hit with a low wind-up)',
          'costume: Saxo soul (a long dark curly wig, gold hoops, a butter-yellow quilted jacket open over a white '
          'camisole, cream trousers, white sneakers)',
          'a live band\'s drifting tempo: the beat grid fitted to a DP beat tracker over the window (119.202 BPM, '
          'within 32 ms); the window chosen where the tempo holds'],
  'notes': "The user's queue: 'recreate this famous viral video: follow the video itself (its scenes, gags and "
           "choreography), not just its song' (the link, queued where YouTube was blocked: Olivia Dean - Love Me Not "
           "in the Live Lounge, BBC Radio 1, 2025-09-30, 10M views; her cover of Ravyn Lenae's song). The video is a "
           "live session in a dark studio: the singer at a standing mic in headphones in front of a red Radio 1 Live "
           "Lounge board, a butter-yellow quilted jacket over a white top, long dark curls; the band in black with "
           "headphones: a drummer in a glass booth (the opening wide is from behind him), a red-and-white electric "
           "guitar (close-ups of the hands), a bass, keys with a vase of white flowers on them, a horn section "
           "(trombone, sax, trumpet) that comes in on the chorus, plants, slanted blue neon. Her choreography is her "
           "hands: a hand on the heart, clasped hands, a paw on the mic, a raised hand, smiles. We recreate its shots "
           "in its order over the song's first 66 s (the only stretch where the live band's tempo is steady enough "
           "for our beat grid): the drum wide, the guitar close, the singer's medium, close and raised hand, the horn "
           "player in the foreground with the singer far, the keys and flowers, the drums close, the bass with the "
           "singer far, over the keys, the horns coming up. The board is our parody (RADIO, a paw in a circle, LIVE "
           "LOUNGE), no real logo. Whole cast: Saxo (the lead, the singer), Compote (always angry: the drummer's "
           "glare), Sadi (the romance: grooving on the red guitar by the stage), Kob (never impressed: she plucks the "
           "daisies on her keyboard, love me, love me not, and ends on the bare stem, the song's title as the button).",
  'with': ['sadi', 'kob', 'compote'],
  'clips': sorted(clips - BASE),
  'shots': shots,
  'yt': 'end',
  'tags': {'structure': 'recreation', 'scenes': [], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'action',
           'maps': ['studio'], 'ref': 'none',
           'lyric_literal': "L02 the hand on the heart, L03 hold (paws clasped), L07 the paw on the mic, L09 and L13 come (the beckon), L12 the raised paw; the title (love me not) as Kob's daisy",
           'experiment': "Does a faithful shot-for-shot recreation of a famous live-session video (the user's queue) with our cast as the band beat our original stories on views and shares?"},
}
out = os.path.join(os.path.dirname(__file__), '2026-09-28.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots', len(ep['clips']), 'clips', 'end', END)
starts = [T(s['beat']) if i else 0 for i, s in enumerate(shots)]
print('sheet times:', ','.join(str(round((starts[i] + (starts[i + 1] if i + 1 < len(shots) else END)) / 2, 2)) for i in range(len(shots))))
