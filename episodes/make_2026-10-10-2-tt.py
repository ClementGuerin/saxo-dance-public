# make_2026-10-10-2-tt.py: writes episodes/2026-10-10-2-tt.json, the TikTok cut of "WHERE IS MY HUSBAND!" (RAYE) on
# TikTok's official sound (RAYE's own, music id 7548420986895861761, 60 s, 318,017 videos; first in the plain and the
# most-used searches, `filter_by=title` listed covers): song 2.1751-62.1751 s at the song's own speed
# (~/personal/saxo-video/songs/where-is-my-husband/tt_rate.py: 29 log-spectrum pieces of 3 s, 0.7 ms residual).
# TikTok muted the main post (itemMute), 2026-10-10 20:00; the post check's hide read back "Everyone", the run's retry
# found it "Only me".
# The sound lies before the main cut (song 54.815-123.160 s, song beat 106 on) but is its music one 100-beat cycle
# earlier: the song repeats itself every 100 beats (chorus 32 + the stop bar 4 + verse 32 + pre-chorus 32), and every
# bar of the sound matches the main 100 beats later at lag 0 (tt_sections.py: log-spectrum cosine 0.92-0.997). The
# words too, but for the verse: a line-hash check of the LRC (keywords.py's repeat groups) puts chorus 1 = the main's
# chorus 2, the tag = its tag, pre-chorus 1 = its pre-chorus 2, chorus 2's first lines = its chorus 3's; verse 1 sings
# new words (13 lines) on verse 2's melody: its 'praying' on the same beat as verse 2's (61.1 against 61.0), its
# 'waiting' just before the yawn, the rest neutral to the search. So the kit's grid starts on song beat 6 (chorus 1's
# downbeat, the first downbeat inside the sound, at 0.914 s) and tt beat = main beat:
#   tt 0 s-b4        the hook (main b0: the swoop down to the stage, Sadi dancing at the ribbon mic, Saxo right behind
#                    her doing the same move), 0.914 s longer at its start (the intro's last 1.77 beats): its clips set
#                    back by as much, so the dance stays on the music
#   tt b4-b100       the main's shots on their own bars (main b4-b100): the supper club (chorus 1), the tag, the hotel
#                    search (on verse 1's words), back on stage with HE'S BEHIND YOU! (pre-chorus 1)
#   tt b100-b114.23  chorus 2's first 14.23 beats, where the main's chorus 3 is squeezed (its payoff, the band's dead
#                    stop and the button lie past the sound): the copycat line behind her (main b100, as it was), on
#                    'husband' she spins and the whole line freezes (main b114.5, 2 beats), he holds the open ring out
#                    behind her and the room gasps (main b120, 2), the ring at her shoulder by his hopeful face (main
#                    b124, 1.63), she starts to turn (main b128, 1.77), and on 'find' she has turned: face to face
#                    with him and the open ring, her paws at her cheeks (main b129.35, 2.83, to the sound's end); the
#                    loop cuts to the hook, as the main's button does
# Built from episodes/2026-10-10-2.json (run make_2026-10-10-2.py first). Uploaded silent: the official sound is added
# in TikTok Studio. Every actor and map timing in these shots counts from the shot's start, so a moved shot keeps them.
import copy, json, os

HERE = os.path.dirname(os.path.abspath(__file__))
ID, MAIN = '2026-10-10-2-tt', '2026-10-10-2'
PER = 60 / 115.9961                                # a beat (the sound plays the song at its own speed)
DT0 = 0.914                                        # tt time of tt beat 0 (song beat 6, chorus 1's downbeat)
END = 60.0                                         # the video: the whole sound
END_B = (END - DT0) / PER
assert abs(END_B - 114.229) < 0.002, END_B
main = json.load(open(os.path.join(HERE, MAIN + '.json')))
M = {s['beat']: s for s in main['shots']}
T = lambda b: round(DT0 + b * PER, 3)              # tt beat -> tt seconds

def moved(mb, tb=None, what=None):
    """main shot mb at tt beat tb (default: its own); its timings count from the shot's start, so they move with it"""
    tb = mb if tb is None else tb
    s = copy.deepcopy(M[mb]); s['beat'] = round(tb, 3)
    s['lyric'] = f"(tt {T(tb) if tb else 0} s, main beat {mb}) " + (what or s.get('lyric', ''))
    return s

# ---- the hook: the video starts 0.914 s before the main's b0, so its clips start that much earlier ----
HOOK = moved(0)
assert [(a['who'], a['at'], a.get('speed', 1)) for a in HOOK['actors']] == [
    ('sadi', 5.0, 1), ('saxo', 5.0, 1), ('kob', 1.6, 1), ('compote', 1.6, 1)], HOOK['actors']
for a in HOOK['actors']:
    a['at'] = round(a['at'] - DT0 * a.get('speed', 1), 4)
HOOK['lyric'] = HOOK['lyric'].replace(') ', f', {DT0} s longer at its start) ', 1)

# ---- the story on its own bars; the hotel search now plays on verse 1's words ----
VERSE1 = {36: "verse 1 ('man... waiting'): down the long corridor, the white doorway behind: she walks alone; he "
              "tiptoes right behind her in step",
          40: "verse 1 (after 'waiting'): she stops and yawns, tired of waiting; behind her he yawns the same yawn",
          44: "verse 1 ('time'): she whirls round to look back down the corridor: his head pokes out of a doorway right "
              "beside her",
          48: "verse 1: her head drops: no husband, no ring; right behind her he holds up the open ring box, sparkling",
          52: "verse 1 ('hands... wait'): at the foot of the grand staircase she clutches her heart; behind her he "
              "clutches his",
          56: "verse 1 ('long... waiting'): she sways, dreaming, gazing up the grand staircase; behind her he sways the "
              "same way",
          64: "verse 1 ('arms... give'): she whirls round: the hall is empty but for a new marble statue on the plinth, "
              "a dog in a fedora frozen mid-dance; she looks straight past it"}
assert all(M[b]['map'] == 'hotel' for b in VERSE1) and 'praying' in M[60]['lyric'], 'the verse shots moved'
STORY = [HOOK] + [moved(mb, what=VERSE1.get(mb)) for mb in sorted(M) if 0 < mb < 100]

# ---- the ending: the main's chorus 3 squeezed into chorus 2's first 14.23 beats ----
LINE = moved(100)                                  # b100-104: the copycat line, as it was
FREEZE = moved(114.5, 104, "'husband': she spins round: the whole line behind her freezes mid-step like statues")
RING = moved(120, 106, "'taking': she turns back to the room; behind her he holds the open ring out; the whole room gasps")
SHOULDER = moved(124, 108, "'long': the ring sparkling at her shoulder, his hopeful face beside it")
TURN = moved(128, 109.63, "she starts to turn round")
FOUND = moved(129.35, 111.4, "'find': she has turned round: face to face with him, he holds out the open ring, her paws "
              "fly to her cheeks")
assert FREEZE.get('still') and all(a.get('holdAt') == 0 for a in FREEZE['actors'][1:]), FREEZE
assert [a['who'] for a in FOUND['actors']] == ['sadi', 'saxo'] and FOUND['actors'][1]['hold'] == 'ringopen', FOUND
shots = STORY + [LINE, FREEZE, RING, SHOULDER, TURN, FOUND]

for sh in shots:
    assert not any(k2.startswith('word') for k2 in sh), sh['lyric']
    assert all(a.get('clip') != 'tpose' for a in sh['actors'])
    assert not sh.get('stop'), 'the band never stops dead inside the sound'
beats = [s['beat'] for s in shots]
assert beats == sorted(beats) and len(set(beats)) == len(beats), 'shots out of order'
assert T(beats[-1]) < END - 0.8, 'the last shot is too short'
clips = {a['clip'] for s in shots for a in s['actors']}
ep = {**{k2: v for k2, v in main.items() if k2 not in ('shots', 'clips', 'song', 'n', 'yt', 'new', 'notes', 'logline')},
      'n': '2-tt',
      'song': {'title': 'WHERE IS MY HUSBAND!', 'artist': 'RAYE', 'window': [2.1751, 62.1751], 'rate': 1, 'bpm': 115.9961,
               'tiktok_sound': {'music_id': '7548420986895861761', 'title': 'WHERE IS MY HUSBAND!', 'author': 'RAYE',
                                'seconds': 60, 'videos': 318017}},
      'logline': "Sadi, a 1940s torch singer in a red sequin gown, sings where is my husband to a whole supper club and "
                 "searches the grand hotel for him, while Saxo, the husband in a pinstripe suit and fedora, is right "
                 "behind her the whole time, copying her every move with a ring box in his paw and hiding worse every "
                 "time she turns (behind the mic stand's thin pole, in a doorway, as a marble statue, flat on the "
                 "floor); the room points, Kob holds up HE'S BEHIND YOU!, the whole stage copies her behind her back and "
                 "freezes when she spins, and on 'find' she finally turns round: he's holding out the ring.",
      'new': ["the TikTok cut keeps the main's shots on their own bars (the official sound is the main's music one "
              "100-beat cycle earlier: chorus 1, the tag, verse 1 and pre-chorus 1, the hotel search playing on verse "
              "1's new words) and squeezes chorus 3's payoff into chorus 2's first 14.23 beats, the reveal on 'find'"],
      'notes': "TikTok muted the main post (itemMute, 2026-10-10). The official sound (RAYE's own, 318,017 videos, 60 s) "
               "is song 2.1751-62.1751 s at the song's own speed (29 log-spectrum pieces of 3 s, 0.7 ms residual): the "
               "main kit's music 100 beats earlier (tt beat = main beat). See the generator's header.",
      'clips': sorted(c for c in clips if c in set(main['clips'])), 'shots': shots}
ep['tags'] = {**main['tags'],
              'experiment': main['tags'].get('experiment', '') + " (TikTok cut on the 60 s official sound: the main's "
              "shots on their own bars one cycle earlier, chorus 3's payoff squeezed into the last 14.23 beats)"}
out = os.path.join(HERE, ID + '.json')
json.dump(ep, open(out, 'w'), ensure_ascii=False, indent=1)
print(out, len(shots), 'shots,', len(ep['clips']), 'clips (not in the main list:', sorted(clips - set(main['clips'])), ')')
starts = [T(s['beat']) if i else 0 for i, s in enumerate(shots)]
ends = starts[1:] + [END]
print('ending:', ', '.join(f"main b{s['lyric'].split('main beat ')[1].split(')')[0]} at tt b{s['beat']} ({T(s['beat'])} s)" for s in shots[-6:]))
print('shot starts:', ','.join(map(str, starts)))
print('sheet times:', ','.join(str(round((a + b) / 2, 2)) for a, b in zip(starts, ends)))
print('first and last frames:', 0.0, round(END - 1 / 30, 3))
