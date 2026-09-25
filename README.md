<p align="center">
  <a href="https://saxo.dance"><img src="docs/readme/wordmark.png" width="520" alt="saxo.dance"></a>
</p>

<p align="center">
  <b>A scruffy grey terrier in a check suit dances to pop hits in PlayStation&nbsp;1 worlds.</b><br>
  One video a day, made entirely in code: three.js draws every frame, ffmpeg cuts it, a scheduled run posts it.
</p>

<p align="center">
  <img src="docs/readme/hero.gif" width="100%" alt="Saxo, Sadi, Kob and Compote dance the YMCA in front of the Eiffel Tower, in the PS1 look">
</p>

<p align="center">
  <a href="https://www.tiktok.com/@saxo.dance"><img src="https://img.shields.io/badge/TikTok-%40saxo.dance-ff5fa2?style=for-the-badge&logo=tiktok&logoColor=white&labelColor=2a1636" alt="TikTok @saxo.dance"></a>
  <a href="https://www.instagram.com/saxo.dance"><img src="https://img.shields.io/badge/Instagram-%40saxo.dance-ff5fa2?style=for-the-badge&logo=instagram&logoColor=white&labelColor=2a1636" alt="Instagram @saxo.dance"></a>
  <a href="https://www.youtube.com/channel/UCkJ-SUUz6dUcAmpfYQ4zZng"><img src="https://img.shields.io/badge/YouTube-Saxo%20Dance-ff5fa2?style=for-the-badge&logo=youtube&logoColor=white&labelColor=2a1636" alt="YouTube Saxo Dance"></a>
  <a href="https://saxo.dance"><img src="https://img.shields.io/badge/Play-saxo.dance-ffd43b?style=for-the-badge&labelColor=2a1636" alt="Play at saxo.dance"></a>
  <a href="https://claude.com/claude-code"><img src="https://img.shields.io/badge/Built%20with-Claude%20Opus%205.5-d97757?style=for-the-badge&logo=claude&logoColor=white&labelColor=2a1636" alt="Built with Claude Opus 5.5"></a>
</p>

<div align="center">
  <table>
    <tr>
      <td align="center"><h3>4</h3>characters</td>
      <td align="center"><h3>34</h3>looks</td>
      <td align="center"><h3>29</h3>maps</td>
      <td align="center"><h3>467</h3>dance and action clips</td>
      <td align="center"><h3>1</h3>video a day</td>
      <td align="center"><h3>$0</h3>per video</td>
    </tr>
  </table>
</div>

> [!NOTE]
> **Public mirror.** This is the public copy of a private repo: the renderer, the maps, the website and the tools are all here. The songs, lyrics, Mixamo clips, 3D models and research notes stay private, so the renderer won't run out of the box.

## What a video looks like

<table>
  <tr>
    <td width="290" valign="top">
      <img src="docs/readme/episode.gif" width="270" alt="The opening of the 25 September episode: Saxo changes outfit on every beat, a SLAY. burst, then Kob">
      <br><sub>25 Sept, "Nicole Kidman" (ADÉLA): a try-on montage cut on the beat, then Kob's verdict.</sub>
    </td>
    <td valign="top">
      <p><b>The format.</b> A pop hit, cut to at least 62 seconds on a section boundary, never mid-line. Every cut lands
      on a beat: a one-bar hook, verse shots with a drone, crane, orbit or track, four one-beat flash cuts into the drop,
      then a new map on every bar of the chorus. The camera punches in on every beat.</p>
      <p><b>The karaoke.</b> Each word springs in as it is sung, in chunky PS1 type: the sung word yellow, the rest pink,
      the longest-held word bigger and shaking. The singer's emoji face hops from word to word.</p>
      <p><b>The jokes.</b> Costume changes on the beat, comic bursts (<i>SLAY.</i>, <i>EW.</i>, <i>POW!</i>), a fight
      with a slow-motion replay, skate tricks, and running gags between four characters who each have one job.</p>
      <p><b>The loop.</b> Comments and trends go in; views, likes and shares come back out into a playbook that the next
      video reads.</p>
    </td>
  </tr>
</table>

## Meet the gang

<table>
  <tr>
    <td align="center" width="25%"><img src="assets/ui/saxo_sticker.png" height="120" alt="Saxo"><br><b>Saxo</b></td>
    <td align="center" width="25%"><img src="assets/ui/sadi_sticker.png" height="120" alt="Sadi"><br><b>Sadi</b></td>
    <td align="center" width="25%"><img src="assets/ui/kob_sticker.png" height="120" alt="Kob"><br><b>Kob</b></td>
    <td align="center" width="25%"><img src="assets/ui/compote_sticker.png" height="120" alt="Compote"><br><b>Compote</b></td>
  </tr>
  <tr>
    <td valign="top">Scruffy grey terrier in a check suit. Always the lead, confident, a bit off: the joke is usually on him.</td>
    <td valign="top">Black-and-tan terrier with a pink bow. The romance and the reality check: falls for him, then sees through him.</td>
    <td valign="top">Grey tabby in a mint tweed blazer and a bell collar. Grumpy, never impressed, secretly the best dancer.</td>
    <td valign="top">Grey dwarf bunny in a plum hoodie, carrot clip in her hair. Always angry. Ask her for one carrot and find out.</td>
  </tr>
</table>

<p align="center">
  <img src="docs/readme/wardrobe.png" width="100%" alt="The wardrobe: every look of Saxo, Sadi, Kob and Compote, from cowboy and astronaut to SpongeBob, hot dog and the poop suit">
</p>

Each map dresses the cast for the occasion: astronaut suits on the moon, cowboy hats out west, SpongeBob and Patrick
in Bikini Bottom, a hot dog in the supermarket. The poop suit is never automatic; an episode has to ask for it.

## 29 maps, and counting

<p align="center">
  <img src="docs/readme/maps.png" width="100%" alt="All 29 maps, from the street, club and moon to Tokyo, Bikini Bottom and Paris, each with the cast in costume">
</p>

Every map is built from primitives in [`src/maps*.js`](src/) and animated as a pure function of time, mostly on the
beat. The club floor flashes, a subway train passes every 16 beats, a locker bangs open every bar, the volcano erupts,
the bowling ball strikes every two bars, and in Paris the fountains fire on the beat while the Eiffel Tower sparkles on
each bar.

## How a video gets made

```mermaid
flowchart LR
    A(["Comments"]) --> B(["Trends"]) --> C(["Song"]) --> D(["Episode"]) --> E(["Render"]) --> F{"QA"}
    F -- fix --> D
    F -- pass --> G(["Post"]) --> H(["Measure"])
    H -. playbook .-> A
    classDef step fill:#ff5fa2,stroke:#2a1636,stroke-width:2px,color:#ffffff
    classDef gate fill:#ffd43b,stroke:#2a1636,stroke-width:2px,color:#2a1636
    class A,B,C,D,E,G,H step
    class F gate
```

Every day at 13:00 a scheduled run follows `research/DAILY_ROUTINE.md` from start to
finish, with no approval step and a hard budget.

1. **Listen.** [`tools/feedback.mjs`](tools/feedback.mjs) reads the week's comments and
   [`tools/trends.mjs`](tools/trends.mjs) scans what is going viral in our niches. What people asked for lands in
   `research/AUDIENCE.md`; live meme formats in `research/MEMES.md`.
2. **Song.** [`tools/cut_song.mjs`](tools/cut_song.mjs) takes the track and a word-level transcript and picks a window of
   62 s or more that starts and ends on section boundaries, preferring to end on the chorus. It writes the audio and
   the karaoke timings; [`tools/beats.mjs`](tools/beats.mjs) finds the BPM, the first beat and the bars.
3. **Episode.** A shot list on the beat grid ([`episodes/`](episodes/)): for each shot a map, a camera move, a dance,
   who is in it and what they wear, plus comic words, paparazzi flashes and action scenes. Without an episode, the shot
   planner builds one from the song.
4. **Render.** [`render.mjs`](render.mjs) drives [`studio.html`](studio.html) in headless Chrome across four tabs, then
   ffmpeg encodes the frames with the song, loudness-normalised to −14 LUFS.
5. **Check.** The QA gate runs before a single frame is rendered (see below), then come contact sheets, a visual review
   of zoomed stills, and a critic's score before anything is posted.
6. **Ship.** [`publish.mjs`](publish.mjs) posts to TikTok, Instagram Reels and YouTube Shorts with per-platform
   captions and hashtags. Each platform gets the cut its rules need: YouTube's is 60 s or less and ends on a lyric line.
7. **Measure.** [`tools/metrics.mjs`](tools/metrics.mjs) snapshots every post at 24 h and 72 h against the channel
   median. Rules that hold up go into `research/PLAYBOOK.md`, which the next run reads.

## Under the hood

### The PS1 look

<p align="center">
  <img src="docs/readme/ps1.png" width="100%" alt="A native 270 by 480 frame of Paris, and Saxo's head magnified 8 times, showing the dither and the facets">
</p>

The 3D is drawn at **270 × 480** with a custom `ShaderMaterial` and scaled up 4× with nearest-neighbour to 1080 × 1920.
What makes it read as a PlayStation game:

- vertices snapped to a 135 × 240 grid, so edges wobble as the camera moves;
- affine texture mapping, with big surfaces cut into ~1.5 m tiles so floors don't swim;
- per-vertex lighting, nearest filtering, and fog;
- 15-bit colour with a 4 × 4 Bayer dither;
- characters with flat normals, so they stay faceted low-poly toys;
- a dithered, screen-door blob shadow tinted to each map's ground.

### One skeleton for everyone

Only Saxo is rigged (Mixamo). Every other character and every costume is an unrigged low-poly model: a four-view
turnaround sheet is drawn from a photo, then turned into 3D ([`tools/character.mjs`](tools/character.mjs)). When the
page loads, each model is fitted over Saxo's body (arm-span scale, feet aligned, best of four orientations) and every
vertex copies the bone weights of its six nearest body vertices. The partners ride clones of his skeleton, so all
467 clips in `assets/mixamo/anims/` play on anyone, with no Blender and no re-rigging.

### A QA gate that can say no

`node render.mjs --qa` samples every frame at 10 fps and measures each character's **skinned mesh**, not its bones:
nobody may sink more than 4 cm into the floor, float more than 5 cm for longer than a jump, or leave the frame for
more than half a second. `--frames` and `--clip` run the gate first and refuse to render on a failure. Every new failure
found by eye becomes a new rule.

### Deterministic frames

The whole video is a pure function of `t`: `window.render3d(t)` picks the shot, lights the map, poses the cast and
renders. Frames can be drawn out of order in parallel tabs, and an interrupted render resumes where it stopped.

## saxo.dance

<p align="center">
  <a href="https://saxo.dance"><img src="site/assets/og.jpg" width="100%" alt="saxo.dance: play Saxo, meet the gang, watch every video"></a>
</p>

<p align="center">
  <img src="docs/readme/site.jpg" width="100%" alt="Saxo TV with every posted video, the dress-up wardrobe, and a chat with Compote in her carrot garden">
</p>

A playable version of the channel in the same PS1 look. Walk Saxo around a floating diorama (the living room, the club,
Compote's carrot garden, the pool), talk to the gang in branching chats, dress up in every costume, and watch every
video on **Saxo TV**. It is plain ES modules and three.js bundled with esbuild ([`site/`](site/)), with a WebAudio house
loop synthesised in the browser: no audio files.

## Quick start

Needs Node 22+, Google Chrome, ffmpeg, and Python 3 with Pillow for the sticker tools. `--gl=metal` picks Chrome's
Metal backend on macOS.

```bash
npm install

# preview in the browser, with sound: http://127.0.0.1:5173/studio.html
node render.mjs --serve

# look before rendering: a contact sheet at chosen times, then the QA gate
node render.mjs --sheet=0.5,3,6,9,12,15 --gl=metal --out=out/check/sheet.jpg
node render.mjs --qa --gl=metal

# render every frame (4 parallel tabs), then encode with the song
node render.mjs --frames --workers=4 --gl=metal
node render.mjs --encode --out=out/my-video.mp4

# render an episode instead of the planner's cut
node render.mjs --frames --workers=4 --gl=metal --query=episode=2026-09-25

# captions and hashtags for each platform, without posting
node publish.mjs out/my-video.mp4 --dry-run
```

Handy page params for previews (`--query=a=b&c=d`, or in the studio URL): `map=paris` forces a map,
`maps=club,moon,paris` sets the rotation, `cast=duo&with=kob` puts a partner beside Saxo, `outfit=sponge` forces a look,
`scene=fight` renders an action scene, `bounce=0` turns off the beat punch.

## Repository map

| Path | What's inside |
|---|---|
| [`render.mjs`](render.mjs) | the renderer: preview, contact sheets, stills, QA gate, frames, encode, GIF |
| [`src/ps1.js`](src/ps1.js) | the 3D side: PS1 shader, characters and costumes, camera moves, shot planner |
| [`src/maps*.js`](src/), [`src/mapkit.js`](src/mapkit.js) | the maps and their shared building blocks |
| [`src/scenes.js`](src/scenes.js) | action scenes: skate, fight |
| [`src/ch/dance.js`](src/ch/dance.js) | the 2D layer: karaoke, stickers, comic bursts, watermark |
| [`episodes/`](episodes/) | one shot list per posted video |
| [`assets/`](assets/) | the stickers, pixel icons, profile pictures and the font (the rig, clips, 3D models and songs are private) |
| [`tools/`](tools/) | song cutting, beats, the character pipeline, stickers, metrics, trends, the website tools |
| [`publish.mjs`](publish.mjs) | posts a render to TikTok, Instagram and YouTube |
| [`site/`](site/) | saxo.dance |

## What it costs

| What | Cost |
|---|---|
| **Each video** | **$0**: three.js and ffmpeg on a laptop |
| A new character or costume | $0.50 for the 3D model, $0.04 per reference image |
| Dance and action clips | free (Mixamo), 467 already on disk |
| Daily caps | $1 of images and APIs, plus $1 of 3D models, logged in `research/spend.jsonl` |

Pay once for reusable assets, never per video: that rule is what makes one video a day sustainable.

<p align="center">
  <br>
  <img src="assets/ui/pixel/saxo_8bit.png" width="48" alt="Saxo">
  <img src="assets/ui/pixel/sadi_8bit.png" width="48" alt="Sadi">
  <img src="assets/ui/pixel/kob_8bit.png" width="48" alt="Kob">
  <img src="assets/ui/pixel/compote_8bit.png" width="48" alt="Compote">
  <br>
  <sub>Made with three.js, ffmpeg, a lot of beat-matching, and Claude Opus 5.5.</sub>
</p>
