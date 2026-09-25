# make_2026-09-25-2.py: writes episodes/2026-09-25-2.json, "Dans le club" (Michou): "Ceux qui sortent pas".
# Kob won't leave her sofa while Saxo, Sadi and Compote party on a yacht in Saint-Tropez, raising a glass "à tous ceux
# qui sortent pas" (cut to Kob, raising her milk). Every chorus ends with the moves the song calls out (un bras, deux
# bras, en bas) and everyone literally dropping dead on "j'dead ça". In the last chorus her sofa is empty: she shows up
# in her pyjamas, leads the moves, and is the only one still standing when the music dies.
# Beats count from B0 = 0.255 s at 115 BPM (cut time = 0.255 + b * 0.5217); lyric beats are in the comments.
import json, os

YACHT = {'ROPE': [2.6, 5.7], 'BOW': [0, -26.5], 'SEA': [9.5, -6], 'WATER': -1.6, 'TABLE': [2.55, -1.2, 0.3], 'KOB': [-0.2, -1.4]}
KX, KZ = YACHT['KOB']
ME, SA, KO, CO = 'michou', 'disco', 'pyjama', 'bouncer'   # the looks of the night (Sadi's white dress looked broken: disco, the user's call)
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
SEATED = dict(face='world', yaw=0)
# chorus formations on the aft deck: a tight V (a narrow 9:16 frame holds ~0.53 x distance across)
TRIO = {'saxo': (0, 0.05), 'sadi': (-0.72, -0.25), 'compote': (0.72, -0.25)}   # side by side: behind Saxo they merged into his head
QUAD = {'kob': (-0.33, 0.3), 'saxo': (0.37, 0.25), 'sadi': (-0.95, -0.45), 'compote': (0.98, -0.45)}
def line2(form, clips, holds={}, **o):   # the whole formation, one clip (or one per character)
    return [A(w, clips[w] if isinstance(clips, dict) else clips, x, z, **({'hold': holds[w]} if w in holds else {}), **o) for w, (x, z) in form.items()]
FALL = {'saxo': ('death_falling_backwards', 1.35), 'sadi': ('knocked_out_falling_to_back', 1.25), 'compote': ('dying_falling_backward', 0.0)}
def dead(form, extra=0.0, speed=1, yaw={'saxo': 20, 'sadi': -25, 'compote': 60}):
    return [A(w, FALL[w][0], x, z, at=round(FALL[w][1] + extra, 2), once=True, ground='mesh', face='world', yaw=yaw[w], speed=speed) for w, (x, z) in form.items() if w in FALL]
# Framing rule: the lyric rows own the top third, so every camera looks at (or above) the head it frames: a face then
# sits at 40-50% of the height. A 1.25 m Saxo at 3 m fills 37-82% of it.
shots = [
  # ---------------- intro, muffled (Kob's flat) ----------------
  shot(0, 'kobflat', [A('kob', 'gaming', KX, KZ, hold='pad', **SEATED), A('saxo', 'hip_hop_dancing_side_to_side', -1.12, 0.05, yaw=12)],
       "Allez viens danser mon pote (b0-3.4): Saxo bursts in dancing, Kob keeps gaming",
       cam([14, 10], [4.6, 4.2], [1.25, 1.2], 0.85), focus=[-0.62, -0.7], stars=['saxo']),
  shot(4, 'kobflat', [A('kob', 'gaming', KX, KZ, hold='pad', at=1.5, **SEATED), A('saxo', 'hip_hop_dancing_side_to_side', -1.2, -0.3, yaw=25, arm='R', aim=[0.35, 0.9, 0.25], upAt=0.3)],
       "Même si tu sais pas danser, vas-y lève-toi (b3.6-7.4): he points her up",
       cam([-30, -22], [4.1, 3.7], [1.2, 1.15], 0.88), focus=[-0.8, -0.85], stars=['saxo']),
  shot(8, 'kobflat', [A('kob', 'gaming', KX, KZ, hold='pad', at=3.0, **SEATED)],
       "Viens, on va danser (b7.6-13.3): Kob close-up, not even a glance: NON.",
       cam([6, 2], [2.6, 2.1], [0.95, 0.9], 0.82), focus=[KX, KZ], stars=['kob'], word='NON.', wordAt=2.5, wordWho='kob'),
  shot(12, 'kobflat', [A('saxo', 'shoulder_shrug', -1.2, 0.15, yaw=10), A('kob', 'gaming', KX, KZ, hold='pad', at=0.4, **SEATED)],
       "(b12-15) Saxo shrugs and goes without her: BON.",
       cam([16, 12], [4.7, 4.5], [1.2, 1.18], 0.86), focus=[-0.7, -0.6], stars=['saxo'], word='BON.', wordAt=0.8, wordWho='saxo'),
  # ---------------- chorus 1: the drums come in on b15 ----------------
  shot(15, 'yacht', [A('saxo', 'hip_hop_just_listening_dancing_variation', 0, 0, hold='glass'),
                     A('sadi', 'female_hip_hop_body_wave_dancing', -0.9, -0.7), A('compote', 'house_dance_variation_3', 0.95, -0.75)],
       "Et j'suis posé dans le club, normal (b14-18.4): the yacht at sunset, Saxo chilling with his juice",
       cam([58, 10], [20, 3.3], [10, 0.75], [0.2, 1.0], [60, 58], 'out')),   # a drone swoops in from the quay: it's a yacht
  shot(18, 'yacht', [A('saxo', 'hip_hop_just_listening_dancing_variation', 0, 0, hold='glass', arm='R', aim='toast', upAt=0.3)],
       "Et j'lève mon verre (b18.6-20): the toast",
       cam([14, 10], [3.0, 2.7], [1.0, 0.95], 1.05, lookX=0.15)),
  shot(20, 'kobflat', [A('kob', 'pointing_while_seated', KX, KZ, hold='milk', at=0.3, arm='R', aim='toast', upAt=0.35, **SEATED)],
       "à tous ceux qui sortent pas (b20-21.7): Kob raises her milk back, deadpan",
       cam([-10, -6], [2.5, 2.25], [0.95, 0.9], 0.82), focus=[KX, KZ], stars=['kob']),
  shot(22, 'yacht', [A('saxo', 'hip_hop_dancing_side_to_side', 0, 0), A('sadi', 'female_hip_hop_body_wave_dancing', -0.85, -0.3), A('compote', 'house_dance_variation_3', 0.85, -0.3)],
       "Ouais j'suis posé dans l'club, normal (b22-26.4): the party from above",
       move='high', wide=1.15, stars=['saxo']),
  shot(26, 'yacht', line2(TRIO, 'hip_hop_just_listening_dancing_variation', holds={'saxo': 'glass', 'sadi': 'glass', 'compote': 'glass'}, arm='R', aim='toast', upAt=0.1),
       "Et j'lève mon verre (b26.6-27.8): the whole squad toasts",
       cam([6, 2], [4.6, 4.3], [1.05, 1.0], 0.95), stars=['saxo']),
  shot(28, 'kobflat', [A('kob', 'gaming', KX, KZ, hold='pad', at=2.2, **SEATED)],
       "à tous ceux qui sortent pas (b28-29.7): she doesn't even look up this time: BOF.",
       cam([16, 12], [2.5, 2.3], [0.95, 0.9], 0.82), focus=[KX, KZ], stars=['kob'], word='BOF.', wordAt=0.8, wordWho='kob'),
  shot(30, 'yacht', line2(TRIO, 'hip_hop_dancing_side_to_side', arm='R', upAt=0.45),
       "Et tu lèves un bras, eh, eh (b30.2-34.8): one arm up (pumps land on b31 and b32)",
       cam([0, 4], [4.6, 4.3], [0.95, 0.9], 0.95), whip=True, stars=['saxo']),
  shot(34, 'yacht', line2(TRIO, 'female_hip_hop_raise_the_roof_dancing', arm='both', upAt=0.45),
       "deux bras, eh, eh (b35-38.8): two arms up",
       cam([-10, -4], [4.3, 4.0], [0.45, 0.5], 1.05, 58), stars=['saxo']),
  shot(38, 'yacht', line2(TRIO, 'air_squat_workout', at=0.2, speed=0.55, arm='both', aim=[0.35, -0.55, 0.75], upAt=0.5),
       "en bas, eh, eh (b39-42.8): down low (the squat bottoms on 'bas', b39.9)",
       cam([8, 4], [4.6, 4.3], [0.9, 0.85], 0.8), stars=['saxo']),
  shot(42, 'yacht', dead(TRIO),
       "j'dead ça, eh, eh (b43-45.5): they literally drop dead (impacts ~b44)",
       cam([-4, 6], [4.4, 4.7], [3.0, 2.8], -0.35), focus=[0, -0.75], word='RIP', wordAt=2.3, wordWho='saxo', wordX=0.74, wordY=0.52, stars=['saxo']),
  # ---------------- verse 1 ----------------
  shot(46, 'lounge', [A('saxo', 'house_dance_variation_3', 0, 0), A('sadi', 'female_hip_hop_body_wave_dancing', -0.8, -0.2), A('compote', 'hip_hop_dancing_side_to_side', 0.8, -0.2)],
       "J'les vois bouger dans l'club, normal (b45.7-50.1): inside, the club",
       cam([14, 4], [4.8, 4.4], [1.15, 1.0], 0.95, 50), stars=['saxo']),
  shot(50, 'yacht', [A('saxo', 'happy_walk', 0, -0.6, mz=1.0, speed=1.8), A('sadi', 'happy_walk', -0.72, -0.9, mz=1.0, speed=1.8), A('compote', 'happy_walk', 0.72, -0.9, mz=1.0, speed=1.8)],
       "L'équipe est là ce soir (b50.3-51.6): the squad walks in",
       cam([2, 0], [3.5, 3.1], [0.28, 0.3], 1.1, 64), stars=['saxo']),
  shot(52, 'yacht', line2(TRIO, 'hip_hop_just_listening_dancing_variation', holds={'saxo': 'phone', 'sadi': 'phone', 'compote': 'phone'}, arm='R', aim='phone', upAt=0.1),
       "dégainez les portables (b52.2-53.9): phones out, flashes",
       cam([-12, -6], [4.5, 4.2], [1.05, 1.0], 0.98), flash=True, stars=['saxo']),
  shot(54, 'yacht', [A('compote', 'angry_forward_gesture', YACHT['ROPE'][0], 5.0, face='world', yaw=0, arm='R', aim=[0.1, 0.3, 0.95], upAt=0.3)],
       "C'est la soirée d'l'année, sois pas en r'tard (b54.1-57.9): the bouncer points at you, late",
       cam([6, 0], [3.4, 2.7], [0.8, 0.8], 0.9), focus=[YACHT['ROPE'][0], 5.1], stars=['compote']),
  shot(58, 'lounge', [A('saxo', 'timid_dancing', 0.3, 0), A('sadi', 'laughing_standing', -0.5, -0.45, yaw=25)],
       "Tu peux bouger ton corps et même si tu danses mal (b58.1-61.9): Saxo dances badly, Sadi laughs: MDR",
       cam([-10, -6], [3.9, 3.6], [1.05, 1.0], 0.98), word='MDR', wordAt=2, wordWho='sadi', wordX=0.24, stars=['saxo', 'sadi']),
  shot(62, 'yacht', [A('compote', 'yelling_in_anger', 0, 0)],
       "J'entends crier Michou (b62.1-64.7): Compote screams",
       cam([10, 4], [2.7, 2.2], [0.85, 0.8], 0.88), whip=True, stars=['compote'], word='AAAH!', wordAt=0.6, wordWho='compote'),
  shot(64, 'yacht', [A('saxo', 'celebrating_after_a_win', 0, 0.05, arm='both', upAt=0.4), A('sadi', 'celebrating_after_a_win', -0.72, -0.25, arm='both', upAt=0.6), A('compote', 'victory_from_a_boxing_win', 0.72, -0.25, arm='both', upAt=0.5)],
       "J'ai mon équipe, impossible qu'on échoue (b64.9-69.7): the squad's victory poses",
       cam([-12, 10], [4.6, 4.6], [0.55, 0.65], 0.95, 56, 'lin'), stars=['saxo']),
  shot(70, 'lounge', [A('compote', 'long_yell_while_standing_leaning_back', 0, 0)],
       "J'entends crier Michou (b69.9-72.3): again, louder",
       cam([-14, -8], [2.8, 2.3], [0.65, 0.65], 0.9, 56), whip=True, stars=['compote'], word='AAAH!', wordAt=0.4, wordWho='compote'),
  shot(72, 'yacht', line2(TRIO, 'gangnam'),
       "J'ai mon équipe, impossible qu'on échoue (b72.5-77.1): all three in sync",
       move='orbit', wide=1.15, angK=0.3, stars=['saxo']),
  shot(76, 'yacht', [A('compote', 'female_hip_hop_arm_wave_dancing', YACHT['TABLE'][0], YACHT['TABLE'][1], lift=0.33),
                     A('saxo', 'hip_hop_dancing_side_to_side', 1.3, -0.35, yaw=10), A('sadi', 'female_hip_hop_body_wave_dancing', 3.25, 0.4, yaw=-10)],
       "Pas d'bouteilles sur la table mais on sait s'ambiancer (b77.2-83.1): milk and carrots, Compote on the table",
       cam([-12, -6], [5.1, 4.7], [1.5, 1.4], 0.85), focus=[2.3, -0.7], stars=['compote']),   # from the south, a little high: the table top reads
  shot(82, 'lounge', [A('saxo', 'male_partner_salsa_variation_one', -0.46, 0, yaw=50), A('sadi', 'female_salsa_dancing', 0.46, 0, yaw=-50)],
       "Et j'fais danser ta fiancée (b83.3-87.3): salsa with Sadi",
       cam([4, 0], [3.6, 3.3], [1.0, 0.95], 0.98), stars=['saxo', 'sadi']),
  shot(86, 'kobflat', [A('kob', 'laying_idle', KX + 0.1, KZ - 0.1, lift=0.1, ground='mesh', face='world', yaw=90)],
       "Et t'as plus le temps de pioncer (b87.4-91.6): Kob tries to sleep, the bass shakes her flat: BOUM",
       cam([12, 8], [3.1, 2.8], [1.6, 1.5], 0.45), focus=[-0.25, -1.45], shake=True, stars=['kob'], word='BOUM', wordAt=1.5, wordWho='kob', wordX=0.7),
  shot(90, 'yacht', [A('saxo', 'hip_hop_just_listening_dancing_variation', 0, -29.4, hold='finger', face='world', yaw=0, arm='R', aim='up', upAt=0.2)],
       "Être numéro un, on le sait (b91.8-95.5): number one at the bow tip, the open sea behind him",
       cam([10, 2], [2.9, 2.5], [0.35, 0.4], 1.15, 58), focus=[0, -29.4], stars=['saxo']),
  # ---------------- pre-chorus ----------------
  shot(94, 'yacht', [A('saxo', 'talking', -0.42, 0, yaw=35), A('sadi', 'bored_idle', 0.42, -0.1, yaw=-40, arm='R', aim=[0.15, 0.4, 0.9], upAt=0.85)],
       "Non, parle pas (b95.7-98.1): she stops him",
       cam([8, 4], [3.5, 3.2], [1.0, 0.95], 0.98), stars=['saxo', 'sadi'], noguests=True),
  shot(98, 'yacht', [A('saxo', 'salsa_dancing_side_to_side', -0.45, -25.3, face='world', yaw=150), A('sadi', 'salsa_dancing_twirl_and_clap', 0.45, -25.5, face='world', yaw=210)],
       "chica, danse avec moi (b98.3-101.8): then she dances with him, on the foredeck at sunset",
       cam([150, 170], [3.6, 3.3], [0.95, 0.9], 0.98), focus=[0, -25.4], spot='bow', stars=['saxo', 'sadi']),
  # was a Titanic pose: arms out read as the T-pose glitch (the user: "a t pose bug lol"), even alive and flapping.
  # Now a date: side by side on the bow sunpad at sunset, turned to each other.
  shot(102, 'yacht', [A('saxo', 'sitting_talking', -0.3, -27.2, face='world', yaw=172, at=6), A('sadi', 'sitting_talking', 0.3, -27.2, face='world', yaw=196, at=20)],
       "S'te plaît regarde-moi, j'reste avec toi ce soir (b102-109.8): a date on the bow sunpad at sunset",
       cam([170, 192], [3.0, 2.6], [0.85, 0.8], 0.72, 52, 'lin'), focus=[0, -27.2], spot='bow', stars=['saxo', 'sadi']),
  # ---------------- chorus 2 ----------------
  shot(110, 'yacht', [A('saxo', 'male_driving_a_car', YACHT['SEA'][0], YACHT['SEA'][1], lift=YACHT['WATER'] + 0.16, face='world', yaw=180, ride='jetski')],
       "Et j'suis posé dans le club, normal (b110-116): Saxo on a jet-ski past the yacht",
       cam([62, 112], [4.6, 4.4], [0.95, 0.8], 0.6, 50, 'lin'), focus=[YACHT['SEA'][0], YACHT['SEA'][1], YACHT['WATER'] + 0.16], ride=1.6, spot='sea', whip=True, stars=['saxo']),
  shot(116, 'kobflat', [A('kob', 'bored_idle', 3.2, -1.95, hold='milk', face='world', yaw=180)],
       "à tous ceux qui sortent pas (b116-117.8): Kob at the window, the yacht party far away",
       cam([-14, -8], [2.6, 2.3], [1.15, 1.1], 1.0), focus=[3.2, -1.95], stars=['kob']),
  shot(118, 'yacht', [A('saxo', 'hip_hop_dancing_side_to_side', 0, 0), A('sadi', 'female_hip_hop_body_wave_dancing', -0.8, -0.25), A('compote', 'house_dance_variation_3', 0.8, -0.25)],
       "Ouais j'suis posé dans l'club, normal (b118-122.4)",
       cam([-16, 14], [4.8, 4.8], [1.5, 1.3], 0.9, 52, 'lin'), stars=['saxo']),
  shot(122, 'yacht', [A('saxo', 'hip_hop_just_listening_dancing_variation', 0, 0, hold='glass', arm='R', aim='toast', upAt=0.3)],
       "Et j'lève mon verre (b122.6-123.8)",
       cam([-12, -8], [3.0, 2.7], [1.0, 0.95], 1.05, lookX=0.15), stars=['saxo']),
  shot(124, 'kobflat', [],
       "à tous ceux qui sortent pas (b124-126): the sofa is empty, the pad left on it",
       cam([6, 2], [2.6, 2.1], [0.95, 0.9], 0.82), focus=[KX, KZ], empty=True, stars=['kob']),   # Kob's own close-up angle, without Kob
  shot(126, 'yacht', [A('kob', 'hip_hop_dancing_side_to_side', 0, 0.3, hold='milk', arm='R', upAt=0.4)],
       "Et tu lèves un bras (b126.2-128): Kob is here, in her pyjamas, milk up",
       cam([6, 2], [3.3, 3.0], [0.95, 0.9], 0.95, lookX=-0.18), whip=True, stars=['kob']),
  shot(128, 'yacht', line2(QUAD, 'hip_hop_dancing_side_to_side', holds={'kob': 'milk'}, arm='R'),
       "eh, eh (b129-130.8): all four",
       cam([0, 3], [5.3, 5.0], [1.0, 0.95], 0.9, 54), stars=['kob']),
  shot(130, 'yacht', line2(QUAD, 'female_hip_hop_raise_the_roof_dancing', arm='both', upAt=0.45),
       "deux bras, eh, eh (b131-134.8)",
       cam([-8, -3], [5.0, 4.7], [0.5, 0.55], 1.0, 58), stars=['kob']),
  shot(134, 'yacht', line2(QUAD, 'air_squat_workout', at=0.2, speed=0.55, arm='both', aim=[0.35, -0.55, 0.75], upAt=0.5),
       "en bas, eh, eh (b135-138.8)",
       cam([16, 10], [5.4, 5.1], [1.3, 1.2], 0.8, 54), stars=['kob']),
  shot(138, 'yacht', dead(QUAD) + [A('kob', 'taunting_throwing_arms_back', *QUAD['kob'], hold='milk')],
       "j'dead ça, eh, eh (b139-141.5): they drop dead, Kob killed it",
       cam([-4, 4], [4.6, 4.9], [2.9, 2.7], 0.1), focus=[0, -1.05], word='RIP', wordAt=2.3, wordWho='saxo', wordX=0.8, wordY=0.47, stars=['kob'], guestsDie=72.95),   # the whole party goes down this time
  shot(141.7, 'yacht', dead(QUAD, extra=1.94, speed=0.3) + [A('kob', 'big_yawn_while_standing', *QUAD['kob'], holdL='milk', at=0.3)],
       "(silence, b141.7-end): the bodies, and Kob yawns",
       cam([4, 2], [4.6, 4.3], [2.45, 2.25], 0.3), focus=[-0.1, -0.9], still=True, calm=True, stars=['kob'], guestsDie=72.95, word='BOF.', wordAt=1.2, wordWho='kob'),
]

# No comic word bursts (NON., BOF., RIP, MDR, AAAH!...): the user, 2026-09-25, "cringier than funnier". The shot
# list keeps them as notes; they are stripped here, so the engine never draws one.
for sh in shots:
    for k in [k for k in sh if k.startswith('word')]: del sh[k]
BASE = {'tpose', 'gangnam', 'twist', 'macarena', 'silly_twist', 'chicken', 'twerk', 'ymca', 'robot', 'shopping_cart', 'running_man', 'moonwalk', 'shuffle', 'tut', 'booty_step', 'arm_wave', 'snake', 'shimmy', 'charleston', 'samba', 'belly', 'northern_soul_spin'}
ep = {
  'date': '2026-09-25', 'n': 2,
  'song': {'title': 'Dans le club', 'artist': 'Michou', 'window': [8.40, 82.60], 'bpm': 115.0, 'tail': 1.4},
  'logline': "Kob won't leave her sofa while the squad parties on a yacht in Saint-Tropez, toasting 'à tous ceux qui sortent pas' (cut: Kob raising her milk); every chorus ends with everyone literally dropping dead on 'j'dead ça', and in the last one Kob shows up in her pyjamas, leads the moves and is the only one left standing.",
  'new': ['yacht map (Saint-Tropez quay at sunset, jet-skis, pet party guests, velvet rope, bow)', "kobflat map (Kob's flat: sofa, TV, harbour window)", 'lounge map (the yacht club: LED floor, LE CLUB neon)',
          'four characters on screen at once (actors shots)', 'props in paws (juice, milk, phones, pad, foam finger)', 'jet-ski', 'costumes: Saxo michou, Sadi white, Kob pyjama, Compote bouncer'],
  'with': ['sadi', 'kob', 'compote'],
  'clips': sorted({a['clip'] for s in shots for a in s['actors']} - BASE),   # library clips beyond the ones every render loads
  'shots': shots,
  'tags': {'structure': 'copycat', 'scenes': [], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'lyric',
           'maps': ['kobflat', 'yacht', 'lounge'], 'ref': 'none',
           'lyric_literal': "Et j'lève mon verre à tous ceux qui sortent pas / Et tu lèves un bras, deux bras, en bas, j'dead ça",
           'experiment': 'Does a French song with a running cutaway gag (the stay-at-home friend) and all four characters on screen hold viewers better than the one-location format?'},
}
out = os.path.join(os.path.dirname(__file__), '2026-09-25-2.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots', len(ep['clips']), 'clips')
