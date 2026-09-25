# make_2026-09-25-2-tt.py: writes episodes/2026-09-25-2-tt.json, the TikTok cut of "Dans le club" (Michou) on TikTok's
# official 32 s sound (music id 6856788296605911042, 67.7k videos), which is song 120.00-152.37 s: the end of chorus 3,
# the "j'dead ça" chant and the spoken "j'suis fatigué" outro. Same story as the main episode, TikTok-sized: Saxo
# toasts "à tous ceux qui sortent pas" (cut: Kob at home, milk), the moves, and every "j'dead ça" kills more of the
# party (the squad, then the guests, then the club inside); on the outro they lie there wrecked, and Kob, who stayed
# in, goes to bed. Uploaded silent: the official sound is added in the TikTok app (label songs are muted otherwise).
# Beats: B0 = -0.742 s (song beat 228, a downbeat), 115 BPM: cut time = -0.742 + b * 0.5217.
import json, os, importlib.util
spec = importlib.util.spec_from_file_location('main', os.path.join(os.path.dirname(__file__), 'make_2026-09-25-2.py'))
# reuse the helpers and formations of the main episode without writing its JSON
src = open(spec.origin).read().split('\nshots = [')[0]
ns = {}; exec(src, ns)
A, cam, shot, line2, dead, TRIO, YACHT, KX, KZ, SEATED = (ns[k] for k in ['A', 'cam', 'shot', 'line2', 'dead', 'TRIO', 'YACHT', 'KX', 'KZ', 'SEATED'])
T = lambda b: round(-0.742 + b * 60 / 115, 3)   # cut seconds of beat b
BASE = {'tpose', 'gangnam', 'twist', 'macarena', 'silly_twist', 'chicken', 'twerk', 'ymca', 'robot', 'shopping_cart', 'running_man', 'moonwalk', 'shuffle', 'tut', 'booty_step', 'arm_wave', 'snake', 'shimmy', 'charleston', 'samba', 'belly', 'northern_soul_spin'}

shots = [
  shot(0, 'yacht', [A('saxo', 'hip_hop_just_listening_dancing_variation', 0, 0, hold='glass'),
                    A('sadi', 'female_hip_hop_body_wave_dancing', -0.85, -0.95), A('compote', 'house_dance_variation_3', 0.9, -1.0)],
       "J'suis posé dans l'club, normal (b2-5): the yacht at sunset",
       cam([-10, 2], [3.7, 2.9], [0.45, 0.55], 1.05, 60)),
  shot(6, 'yacht', [A('saxo', 'hip_hop_just_listening_dancing_variation', 0, 0, hold='glass', arm='R', aim='toast', upAt=0.3)],
       "Et j'lève mon verre (b6.6-8)", cam([14, 10], [3.0, 2.7], [1.0, 0.95], 1.05, lookX=0.15)),
  shot(8.5, 'kobflat', [A('kob', 'pointing_while_seated', KX, KZ, hold='milk', at=0.3, arm='R', aim='toast', upAt=0.25, **SEATED)],
       "à tous ceux qui sortent pas (b8.5-10): Kob at home raises her milk", cam([-10, -6], [2.5, 2.25], [0.95, 0.9], 0.82), focus=[KX, KZ], stars=['kob']),
  shot(10, 'yacht', line2(TRIO, 'hip_hop_dancing_side_to_side', arm='R', upAt=0.45),
       "Et tu lèves un bras, eh, eh (b10.2-14)", cam([0, 4], [4.6, 4.3], [0.95, 0.9], 0.95), whip=True, stars=['saxo']),
  shot(14, 'yacht', line2(TRIO, 'female_hip_hop_raise_the_roof_dancing', arm='both', upAt=0.45),
       "deux bras, eh, eh (b15-18)", cam([-10, -4], [4.3, 4.0], [0.45, 0.5], 1.05, 58), stars=['saxo']),
  shot(18, 'yacht', line2(TRIO, 'air_squat_workout', at=1.63),
       "en bas, eh, eh (b19-22)", cam([22, 16], [4.6, 4.3], [1.25, 1.15], 0.8), stars=['saxo']),
  shot(22, 'yacht', dead(TRIO),
       "j'dead ça, eh, eh (b23-25.4): the squad drops dead", cam([-4, 6], [4.4, 4.7], [3.0, 2.8], -0.35), focus=[0, -0.75],
       word='RIP', wordAt=2.3, wordWho='saxo', wordX=0.78, wordY=0.5, stars=['saxo']),
  shot(28, 'yacht', dead(TRIO, extra=3.13, speed=0.3),
       "J'dead ça, j'dead ça (b29, b31): the guests go down in two waves", cam([30, 8], [6.4, 6.0], [2.2, 2.0], 0.3), focus=[-0.6, -1.4],
       guestsDie=T(29) + 0.05, stars=['saxo']),
  # (an empty railing shot at b32 was cut: without its RIP badge it was a dead frame; the wide shot runs on)
  shot(36, 'yacht', dead(TRIO, extra=7.3, speed=0.2),
       "J'dead ça, j'dead ça (b37, b39): the wreckage from above", cam([0, 30], [7.0, 7.4], [6.0, 7.0], 0.0, 52, 'lin'), focus=[0, -1.0],
       guestsDie=T(29) + 0.05, still=False, stars=['saxo']),
  shot(40, 'kobflat', [A('kob', 'gaming', KX, KZ, hold='pad', at=2.2, **SEATED)],
       "eh, eh (b41-42): Kob, home, fine: BOF.", cam([16, 12], [2.5, 2.3], [0.95, 0.9], 0.82), focus=[KX, KZ], stars=['kob'],
       word='BOF.', wordAt=1, wordWho='kob'),
  shot(44, 'yacht', [A('saxo', 'laying_idle', 0, 0.25, ground='mesh', face='world', yaw=0)],
       "On a bien dansé là gros (b44-46): Saxo flat on the deck, from above", cam([8, 0], [0.95, 0.8], [2.5, 2.3], 0.1), guestsDie=T(29) + 0.05, calm=True, stars=['saxo']),
  shot(48, 'yacht', [A('sadi', 'laying_idle', -0.42, 0.25, ground='mesh', face='world', yaw=-8, at=4), A('compote', 'laying_idle', 0.45, 0.2, ground='mesh', face='world', yaw=10, at=8)],
       "wouah, j'suis fatigué (b49-50.5): Sadi and Compote, wrecked, from above", cam([-6, 0], [1.2, 1.0], [2.9, 2.7], 0.1), guestsDie=T(29) + 0.05, calm=True, stars=['sadi', 'compote']),
  shot(52, 'yacht', [A('saxo', 'laying_idle', 0, 0.3, ground='mesh', face='world', yaw=0, at=3)],
       "J'suis en sueur, j'sais pas toi mais là (b52.8-56): Saxo, close from above, looks up at you", cam([4, 0], [0.55, 0.45], [1.75, 1.6], 0.1), guestsDie=T(29) + 0.05, calm=True, stars=['saxo']),
  shot(56, 'kobflat', [A('kob', 'laying_idle', KX + 0.1, KZ - 0.1, lift=0.1, ground='mesh', face='world', yaw=90)],
       "j'ai trop dansé, frère (b56-end): Kob, who stayed in, goes to bed: ZZZ", cam([12, 8], [3.1, 2.8], [1.6, 1.5], 0.45), focus=[-0.25, -1.45], stars=['kob'], word='ZZZ', wordAt=3, wordWho='kob', wordX=0.7),
]
# No comic word bursts (NON., BOF., RIP, MDR, AAAH!...): the user, 2026-09-25, "cringier than funnier". The shot
# list keeps them as notes; they are stripped here, so the engine never draws one.
for sh in shots:
    for k in [k for k in sh if k.startswith('word')]: del sh[k]
ep = {
  'date': '2026-09-25', 'n': '2-tt', 'tiktok_sound': {'music_id': '6856788296605911042', 'window': [120.0, 152.37], 'videos': 67738},
  'song': {'title': 'Dans le club', 'artist': 'Michou', 'window': [120.0, 152.37], 'bpm': 115.0},
  'logline': "TikTok cut on the official sound: the squad parties on the yacht, every 'j'dead ça' kills more of the party, they lie there wrecked on 'j'suis fatigué', and Kob, who stayed in, goes to bed.",
  'with': ['sadi', 'kob', 'compote'],
  'clips': sorted({a['clip'] for s in shots for a in s['actors']} - BASE),
  'shots': shots,
  'tags': {'structure': 'copycat', 'scenes': [], 'cast': ['saxo', 'sadi', 'kob', 'compote'], 'hook': 'lyric', 'maps': ['yacht', 'kobflat', 'lounge'], 'ref': 'none',
           'lyric_literal': "j'dead ça", 'experiment': "TikTok's most-used official sound for the song (67k videos) instead of the 60 s one"},
}
out = os.path.join(os.path.dirname(__file__), '2026-09-25-2-tt.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots')
