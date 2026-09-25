# make_2026-09-25-3.py: writes episodes/2026-09-25-3.json, "99 Luftballons" (Snoblack techno, from 0:22): "La voisine".
# Saxo's techno night: on the drop 99 balloons rain from the ceiling onto the dance floor. Compote, the bouncer, takes
# them for an invasion (she points, sends a paper-plane squadron, hurls her carrot); upstairs Kob, who never goes out,
# sees them float past her window like UFOs while the bass shakes her flat. On the music's one-bar break she walks in
# in her pyjamas; on "99 Kriegsminister" 99 neighbours in pyjamas stand behind her, and they end up raving in sync.
# Kob isn't having it: she finds the booth's plug and yanks it on the last word, the moment the music stops dead.
# Button: silence, the club in the dark, one red balloon floating up (the clip's last image).
# Beats count from B0 = 0.000 s at 176 BPM (cut time = b * 0.3409): the kick measured on the transients; the cut is
# 22.025-90.207 s of the song (the downbeat before the drop -> the breakdown's last beat) + 1.64 s of silence.
# Lyric lines are named by number (L00-L23, see episodes/2026-09-25-3.lyrics.js): the lyrics stay in their files.
import json, os

P = 60 / 176.0
T = lambda b: round(b * P, 3)                      # beat -> cut seconds
TECHNO = {'STAGE': 0.9, 'BOOTH': [0, -5.25], 'DOOR': [6.4, 2.6], 'SOCKET': [-2.3, 0.4, -2.55], 'CABLE': [-2.3, 0.03, -2.86], 'PLUG': [-2.3, -2.87]}   # = src/maps6.js
S, BX, BZ = TECHNO['STAGE'], *TECHNO['BOOTH']
DX, DZ = TECHNO['DOOR']
PX, PZ = TECHNO['PLUG']
KX, KZ = -0.2, -0.9                                # Kob's spot in her flat, in front of the sofa
END, STOP = 69.82, T(200)                          # the video's end; the music stops dead at b200 (68.182 s)
ME, SA, KO, CO = 'nena', 'rave', 'pyjama', 'bouncer'   # the looks of the night
def A(who, clip, x=0, z=0, **o):
    look = {'saxo': ME, 'sadi': SA, 'kob': KO, 'compote': CO}[who]
    return {'who': who, 'look': o.pop('look', look), 'clip': clip, 'x': x, 'z': z, **o}
def cam(ang, r, h, look, fov=50, ease=None, **o):
    c = {'ang': ang, 'r': r, 'h': h, 'look': look, 'fov': fov, **o}
    if ease: c['ease'] = ease
    return c
def shot(beat, map_, actors, lyric, c=None, move=None, **o):
    s = {'beat': beat, 'kind': 'dance', 'map': map_, 'actors': actors, 'lyric': lyric, **o}
    if c: s['cam'] = c
    if move: s['move'] = move
    return s
DJ = dict(x=BX, z=BZ, lift=S)   # Saxo behind the decks, turned to the camera
DECKS = dict(arm='both', aim=[0.3, -0.5, 0.8], upAt=0)   # both paws down on the decks
# the neighbours: 99 Kobs in pyjamas, 5 rows of 20 from z 1.6 back to -1.6 (clear of the stage and the plug; the ravers make room: noguests)
def crowd(clip, skip=(), **o):
    return {'who': 'kob', 'look': KO, 'clip': clip, 'n': 99, 'cols': 20, 'x0': 0, 'z0': 1.6, 'dx': 0.78, 'dz': 0.8, 'jitter': 0.1, 'skip': [list(s) for s in skip], **o}
KOBF = (0, 2.1)                                     # the real Kob in front of her neighbours
# Framing rule: the lyric rows own the top third, so every camera looks at (or above) the head it frames: a face then
# sits at 40-50% of the height.
shots = [
  # ---------------- the drop (hook) ----------------
  shot(0, 'techno', [A('saxo', 'hip_hop_just_listening_dancing_variation', **DJ, **DECKS, at=0, speed=0.5)],   # slowed: the head turn comes after the cut
       "(pre-drop bar, b0-4, the intro music has just stopped) Saxo at the decks in Nena's hair under the 99 neon: wait for it",
       cam([-6, 2], [2.9, 2.6], [0.75, 0.75], 0.85), focus=[BX, BZ, S], still=True, signDim=0.7, stars=['saxo']),
  shot(4, 'techno', [A('saxo', 'celebrating_after_a_win', **DJ, arm='both', upAt=0.1), A('sadi', 'jumping_in_place', 0.5, 0.3)],
       "L00 (b4 = the drop): the net opens, 99 balloons rain on the crowd, CO2 blasts; the title line lands on them",
       cam([0, 3], [6.4, 5.6], [0.45, 0.6], [2.7, 1.8], 58, 'out'), focus=[0, -1.5], co2=True, stars=['saxo', 'sadi']),
  # ---------------- verse A: the balloons, the UFOs, the bouncer ----------------
  shot(12, 'techno', [A('saxo', 'house_dance_variation_3', -0.45, 0), A('sadi', 'female_hip_hop_body_wave_dancing', 0.5, -0.15)],
       "L01 (b11-18.7): Saxo and Sadi dance under the floating balloons",
       cam([-14, 10], [3.7, 3.3], [1.0, 0.95], 1.0, 52, 'lin'), stars=['saxo', 'sadi']),
  shot(20, 'kobflat', [A('kob', 'bored_idle', 2.95, -1.2, face='world', yaw=185, arm='R', aim=[0.5, 0.2, 0.85], upAt=0.2)],
       "L02 (b19.1-27.5, 'taken for UFOs'): upstairs, Kob at her telescope: glowing balloons drift past her window; the bass shakes the flat",
       cam([-26, -22], [2.3, 2.1], [1.2, 1.18], 1.1), focus=[3.1, -1.7], ufo=True, scope=True, shake=True, jolt=True, stars=['kob']),   # over her left shoulder: the telescope on her right, the UFOs in the window
  shot(28, 'techno', [A('compote', 'quickly_pointing_angrily_forward', DX, DZ, at=0.2, arm='R', aim=[0.85, 0.5, 0.2], upAt=1.2)],
       "L03 (b27.9-34.3, 'a general sent'): Compote the bouncer at the door, pointing: send the squadron",
       cam([-100, -92], [2.8, 2.5], [0.85, 0.82], 0.9), focus=[DX, DZ], key=[DX - 1.2, 2.2, DZ + 0.6, 0.9, 1.3, 0.8], stars=['compote']),   # the green EXIT glow on her
  shot(36, 'techno', [A('saxo', 'hip_hop_dancing_side_to_side', -0.45, 0), A('sadi', 'female_hip_hop_arm_wave_dancing', 0.5, -0.15)],
       "L04 (b34.6-43.7, 'a squadron after them'): paper planes swoop over the floor after the balloons, on the word",
       cam([8, 0], [4.8, 4.3], [0.55, 0.6], [2.0, 1.25], 60), planes={'n': 9, 'at': T(36) - 0.2, 'pass': [[-4.5, 2.9, -2.5], [4.5, 2.1, 1.0]], 'dur': 1.8, 'size': 1.3}, stars=['saxo', 'sadi']),
  shot(44, 'techno', [A('saxo', 'shuffle', -0.45, 0), A('sadi', 'high_enthusiasm_fist_pump', 0.5, -0.15)],
       "L05 (b44-51.4, 'to sound the alarm'): red beacons spin, and the crowd takes it for the show",
       cam([-10, 6], [4.6, 4.2], [2.5, 2.1], 0.9), alarm=True, stars=['saxo', 'sadi']),
  shot(52, 'techno', [A('compote', 'being_surprised_and_looking_right', 0.35, 0.5), A('saxo', 'house_dance_variation_3', -0.95, -1.3), A('sadi', 'female_hip_hop_body_wave_dancing', 0.9, -1.4)],
       "L06 (b51.7-58.9, 'but on the horizon there were'): Compote on the floor, scanning for the enemy",
       cam([6, 2], [4.0, 3.6], [0.95, 0.9], 0.95), key=[0.6, 2.2, 2.0, 0.9, 0.8, 1.0], stars=['compote']),
  shot(60, 'techno', [A('compote', 'yelling_in_anger', 0, 0.4, hold='balloon', face='world', yaw=40, arm='R', aim=[0.35, 0.35, 0.87], upAt=0)],
       "L07 (b59.2-67.5, 'only 99 balloons'): she has caught one: it's a balloon. She yells at it",
       cam([-12, -6], [2.6, 2.3], [0.95, 0.92], 1.0), key=[0.2, 2.0, 1.8, 0.8, 0.8, 1.0], stars=['compote']),   # she faces 40°, the balloon at arm's length: a 3/4 on her glare
  # ---------------- verse B: the squadron, the battle, the neighbour ----------------
  shot(68, 'techno', [A('saxo', 'jumping_in_place', -0.45, 0), A('sadi', 'jumping_in_place', 0.5, -0.15, at=0.25)],
       "L08 (b67.8-76.6, '99 jets'): the CO2 jets blast on every bar, a V of paper planes crosses, everyone jumps",
       cam([0, 4], [4.4, 4.0], [1.0, 0.95], 1.3, 56), planes={'n': 11, 'at': T(68) - 0.3, 'pass': [[4.5, 2.6, -3.0], [-4.5, 2.0, 0.5]], 'dur': 1.4, 'size': 1.2}, co2=True, stars=['saxo', 'sadi']),
  shot(76, 'techno', [A('saxo', 'high_enthusiasm_fist_pump', 0, 0)],
       "L09 (b76.9-84.6, 'each one a great warrior'): a dance battle ring; Saxo in the middle, pumping his fist like a champion",
       cam([4, 0], [5.0, 4.3], [1.5, 1.4], 0.95), ring=True, stars=['saxo']),
  shot(84, 'spaceship', [A('saxo', 'pointing_onward_charge', 0, 0, at=1.2, look='astronaut', face='world', yaw=0)],
       "L10 (b84.9-91.2, 'thought they were Captain Kirk'): in his head he's on the bridge of a starship, pointing: engage",
       cam([36, 30], [3.0, 2.7], [0.5, 0.55], 1.1, 55), stars=['saxo']),   # 3/4: the point reads along his arm
  shot(92, 'techno', [A('sadi', 'female_hip_hop_raise_the_roof_dancing', 0.1, 0.3), A('saxo', 'bored_idle', -1.15, -1.6, star=False)],
       "L11 (b91.5-99.1, 'that made a big firework'): Sadi takes the ring, confetti cannons fire on the word",
       cam([-6, 4], [4.8, 4.4], [1.3, 1.25], 0.95, 54), ring=True, confetti=T(96), co2=True, stars=['sadi', 'saxo']),
  shot(100, 'kobflat', [A('kob', 'being_surprised_and_looking_right', KX, KZ, at=0.3)],
       "L12 (b99.4-107.2, 'the neighbours didn't get it'): Kob, sleep mask on, the floor shaking under her",
       cam([-34, -30], [2.7, 2.4], [0.85, 0.82], 0.85), focus=[KX, KZ], shake=True, jolt=True, stars=['kob']),
  shot(108, 'kobflat', [A('kob', 'angrily_pumping_fists_forward', KX, KZ)],
       "L13 (b107.4-115.6, 'and felt provoked'): Kob has had enough",
       cam([-10, -6], [2.2, 2.0], [0.7, 0.72], 0.85), focus=[KX, KZ], shake=True, jolt=True, stars=['kob']),
  shot(116, 'techno', [A('compote', 'throwing_and_object', 1.0, 1.2, at=1.1, face='world', yaw=200, hold='carrot', toss={'at': 0.9, 'to': [-0.7, 2.3, -3.5], 'dur': 1.0, 'arc': 0.8}, arm='R', aim=[0.3, 0.9, 0.3], upAt=0.55, upEnd=1.3)],
       "L14 (b115.9-121.8, 'so they fired at the horizon'): Compote hurls her carrot at the balloons (from behind her right shoulder: it flies into the club)",
       cam([72, 78], [3.0, 2.8], [1.6, 1.5], 0.95, 56), focus=[1.0, 1.1], key=[1.6, 2.2, 2.4, 0.8, 0.8, 1.0], stars=['compote']),   # side-on and a little high: her profile, the arm, the carrot flying off into the club
  shot(124, 'techno', [A('saxo', 'hip_hop_dancing_side_to_side', -0.45, 0, hold='balloon'), A('sadi', 'female_hip_hop_body_wave_dancing', 0.5, -0.15)],
       "L15 (b122.1-, 'at 99 balloons'): missed; the balloons dance on, Saxo dances with one",
       cam([12, -6], [3.7, 3.4], [1.0, 0.95], 1.05, 52, 'lin'), stars=['saxo', 'sadi']),
  # ---------------- the break: one bar of silence in the music ----------------
  shot(132, 'techno', [A('kob', 'bored_idle', 6.9, DZ, face='world', yaw=-90, hold='milk')],
       "(break, b132-136, the music drops out) the door opens: Kob in her pyjamas in the doorway, backlit; the ravers freeze",
       cam([-94, -90], [2.9, 2.7], [0.85, 0.85], 0.82), focus=[6.9, DZ], doorOpen=True, freeze=T(132), still=True, key=[5.6, 1.8, DZ, 1.0, 0.9, 0.75], stars=['kob']),   # in front of the rope, the open door behind her
  # ---------------- verse C (the breakdown, half time): 99 neighbours, the plug ----------------
  shot(136, 'techno', [A('kob', 'angrily_pumping_fists_forward', *KOBF, hold='milk')],
       "L16 (b137.1-144.3, '99 war ministers'): 99 Kobs in pyjamas stand behind her, fists pumping in sync",
       cam([0, 0], [4.0, 5.6], [0.8, 3.4], [1.0, 0.7], 52, 'out'), focus=[0, 1.2], crowd=crowd('angrily_pumping_fists_forward', skip=[(*KOBF, 0.6)]), noguests=True, half=True, doorOpen=True, stars=['kob']),
  shot(144, 'techno', [A('kob', 'angry_forward_gesture', *KOBF, hold='milk')],
       "L17 (b144.5-152, 'matches and petrol cans'): behind her back, the neighbours start nodding to the beat",
       cam([-24, -14], [3.6, 3.2], [0.6, 0.65], 0.9, 56), focus=[0, 1.4], crowd=crowd('hip_hop_just_listening_dancing_variation', skip=[(*KOBF, 0.6)]), noguests=True, half=True, stars=['kob']),
  shot(152, 'techno', [A('kob', 'shaking_head_no_dismissively', *KOBF, hold='milk')],
       "L18 (b152.2-159.3, 'thought they were clever'): 99 neighbours raving in sync; Kob shakes her head",
       cam([0, 8], [6.6, 6.2], [2.9, 2.7], 0.8, 52), focus=[0, 0.4], crowd=crowd('house_dance_variation_four', skip=[(*KOBF, 0.6)]), noguests=True, half=True, stars=['kob']),
  shot(160, 'techno', [A('kob', 'being_surprised_and_looking_right', PX + 0.8, PZ + 0.15, at=0)],
       "L19 (b159.6-168, 'already scented fat prey'): Kob at the stage front spots the booth's power plug",
       cam([14, 8], [2.5, 2.3], [0.95, 0.92], 0.8), focus=[PX + 0.45, PZ + 0.25], half=True, stars=['kob']),   # the box at her right, in the frame's left half
  shot(168, 'techno', [A('kob', 'yelling_in_anger', PX, PZ, arm='R', aim=[0.2, -0.62, 0.76], upAt=0.3)],
       "L20 (b168.3-175.6, 'called war and wanted power'): her paw on the plug, she yells",
       cam([16, 10], [2.3, 2.1], [1.25, 1.2], 0.72), focus=[PX, PZ + 0.2], half=True, stars=['kob']),
  shot(176, 'techno', [A('saxo', 'shaking_head_no_dismissively', **DJ, **DECKS)],   # no, no, no (the terrified clip cowers into a hair blob)
       "L21 (b175.9-183.9, 'man, who would have thought'): Saxo at the decks sees her: no, no, no",
       cam([-8, -4], [2.5, 2.3], [0.8, 0.78], 0.88), focus=[BX, BZ, S], half=True, signDim=0.6, stars=['saxo']),
  shot(184, 'techno', [A('kob', 'angry_forward_gesture', PX, PZ, arm='R', aim=[0.2, -0.62, 0.76], upAt=0), A('saxo', 'being_terrified_while_standing', **DJ, at=0.7, speed=0.3),
                       A('sadi', 'female_hip_hop_body_wave_dancing', 1.5, 2.2), A('compote', 'angrily_pumping_fists_forward', 0.3, 2.3)],
       "L22 (b184.2-191.2, 'that it would come this far'): the whole club raving, 99 neighbours included; Kob at the plug",
       cam([22, 16], [8.6, 8.0], [3.2, 3.0], 1.1, 52, 'lin'), focus=[0, -1.0], crowd=crowd('house_dance_variation_four', skip=[(1.5, 2.2, 0.6), (0.3, 2.3, 0.6)], z0=1.6), noguests=True, half=True, stars=['kob', 'saxo']),
  shot(192, 'techno', [A('kob', 'angry_forward_gesture', PX, PZ, arm='R', aim=[0.2, -0.62, 0.76], upAt=0, aim2=[0.35, 0.85, -0.3], aim2At=round(STOP - 0.18 - T(192), 3),
                         hold='plug', holdFrom=round(STOP - 0.18 - T(192), 3), cable=TECHNO['CABLE'])],   # the yank: 0.18 s before the stop, so it reads before the cut
       "L23 (b191.5-199.7, 'because of 99 balloons'): she yanks the plug on the last beat: the music stops dead",
       cam([20, 14], [2.2, 2.0], [0.9, 0.88], 0.8), focus=[PX, PZ + 0.2], half=True, unplugAt=round(STOP - 0.18, 3), blackout=STOP, stars=['kob']),
  # ---------------- button: silence ----------------
  shot(200, 'techno', [A('kob', 'bored_idle', PX, PZ, hold='plug', cable=TECHNO['CABLE'], arm='R', aim=[0.15, 0.1, 0.95], upAt=0)],
       "(silence, b200-end) the club in the dark, everyone frozen; Kob holds the plug; one red balloon floats up",
       cam([2, 0], [3.1, 3.0], [1.0, 1.05], [0.9, 1.15], 52, 'lin'), focus=[PX, PZ + 0.3], unplugAt=0, blackout=STOP, last=[PX + 0.5, PZ - 0.5, STOP - 0.6], still=True, freeze=STOP, key=[PX + 0.2, 1.9, PZ + 1.4, 0.9, 0.85, 0.75], stars=['kob']),
]

# No comic word bursts and no bind pose (the user's calls; the QA gate fails both)
for sh in shots:
    assert not any(k.startswith('word') for k in sh), sh['lyric']
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
BASE = {'tpose', 'gangnam', 'twist', 'macarena', 'silly_twist', 'chicken', 'twerk', 'ymca', 'robot', 'shopping_cart', 'running_man', 'moonwalk', 'shuffle', 'tut', 'booty_step', 'arm_wave', 'snake', 'shimmy', 'charleston', 'samba', 'belly', 'northern_soul_spin'}
clips = {a['clip'] for s in shots for a in s['actors']} | {s['crowd']['clip'] for s in shots if 'crowd' in s}
ep = {
  'date': '2026-09-25', 'n': 3,
  'song': {'title': '99 Luftballons (Techno)', 'artist': 'Snoblack', 'window': [22.025, 90.207], 'bpm': 176.0, 'tail': 1.64},
  'logline': "Saxo's techno night: 99 balloons rain on the dance floor, Compote the bouncer fights them, Kob upstairs takes them for UFOs, "
             "walks in on the break with 99 neighbours in pyjamas, and pulls the plug on the last word, right where the music stops dead.",
  'new': ['techno map (warehouse club: DJ stage under a 99 neon, lasers, CO2 jets, confetti cannons, a balloon drop net, paper planes, the booth plug)',
          'crowds: 99 copies of a character in one pose (detached skinned copies)', "Kob's flat: balloons past the window, a telescope",
          'props: balloon, carrot (thrown), plug with its cable', 'a second arm aim (the yank), half-time beat bounce for a breakdown',
          'costumes: Saxo nena (Nena 1983), Sadi rave'],
  'notes': "Clip brief (Nena, 1983): a foggy heath at dawn with log barriers, the band in coloured smoke, Nena in a black quilted vest over "
           "a white shirt, jeans, big dark hair; at night giant glowing balloons; it ends on a single red balloon in the dark. The user asked "
           "for the 'Dans le club' style and not to follow the clip strictly: the world is a techno club (the Snoblack version), Saxo "
           "wears Nena's look, and the last image is the clip's single red balloon. The story stays on the balloons: no war imagery. "
           "Whole cast: Saxo (DJ, lead), Sadi (dance partner, takes the battle ring), Compote (the bouncer: running thread), Kob (never "
           "goes out: part 2 of 'Dans le club', this time she ends the party; GAGS: she unplugs things).",
  'with': ['sadi', 'kob', 'compote'],
  'clips': sorted(clips - BASE),
  'shots': shots,
  'tags': {'structure': 'interruption', 'scenes': ['crowd'], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'dance',
           'maps': ['techno', 'kobflat', 'spaceship'], 'ref': 'none',
           'lyric_literal': 'L00 the balloons, L02 UFOs, L04 the squadron, L05 the alarm, L08 99 jets, L10 Captain Kirk, L11 the firework, L16 99 ministers',
           'experiment': 'Does an ending that explains the music stopping (Kob pulls the plug on the last beat) hold viewers to the end better than a musical ending?'},
}
out = os.path.join(os.path.dirname(__file__), '2026-09-25-3.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots', len(ep['clips']), 'clips', 'end', END)
