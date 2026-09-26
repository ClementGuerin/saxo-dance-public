# cam.py: camera helpers for episode generators. The house camera since 2026-09-26 (the user, on the ratoshi A/B:
# "I love it, let's use this for the next videos"): the @ratoshidance grammar, research/RATOSHI_ANALYSIS.md, with our
# beat bounce kept on. Reference: episodes/make_ratoshi_test.py (its render: out/ratoshi-test-dans-le-club-bounce.mp4).
#
#   import os, sys; sys.path.insert(0, os.path.dirname(__file__)); from cam import view, vpath, deadpan, ...
#
# Every helper returns (cam, focus) for a shot: `shot(beat, map, actors, lyric, v)` spreads it into 'cam' and 'focus'.
# The engine's camera is polar round the shot's focus (CLAUDE.md "How the renderer works"); these turn positions into
# it. All cameras are `steady` (no float, no legacy sway): drift only where a shot asks for a `hand`.
# The framing rules still hold: the karaoke owns the top 25% (the QA gate fails a head there), faces at 40-55% of the
# height, a lying body is shot from above. Positions are world metres; a character's mark is (x, z) on the floor.
import math


def view(p0, l, fov=50, p1=None, ly1=None, ease=None, fy=0.0, steady=True, **o):
    """A camera at p0 = (x, y, z) looking at l = (x, y, z), moving to p1 by the cut (the look point's height to ly1).
    focus = the look point on the floor; ang/r/h come from the offset. fy: the floor's height (a deck, a stage)."""
    def polar(p):
        dx, dz = p[0] - l[0], p[2] - l[2]
        return round(math.degrees(math.atan2(dx, dz)), 2), round(math.hypot(dx, dz), 3), round(p[1] - fy, 3)
    a0, r0, h0 = polar(p0); a1, r1, h1 = polar(p1 or p0)
    if a1 - a0 > 180: a1 -= 360
    if a0 - a1 > 180: a1 += 360
    c = {'ang': [a0, a1], 'r': [r0, r1], 'h': [h0, h1], 'look': [round(l[1] - fy, 3), round((ly1 if ly1 is not None else l[1]) - fy, 3)], 'fov': fov, **o}
    if steady: c = {'steady': True, **c}
    if ease: c['ease'] = ease
    return c, [l[0], l[2]] + ([fy] if fy else [])


def vpath(ps, l, fov=50, looks=None, ease=None, steady=True, **o):
    """A camera along a path of positions ps = [(x, y, z), ...] (keyframes spread evenly over the move's easing), all
    looking at l; looks = the look point's height at each key (default l's). The swoop is one of these."""
    def polar(p):
        dx, dz = p[0] - l[0], p[2] - l[2]
        return round(math.degrees(math.atan2(dx, dz)), 2), round(math.hypot(dx, dz), 3), round(p[1], 3)
    P = [polar(p) for p in ps]
    c = {'ang': [a for a, _, _ in P], 'r': [r for _, r, _ in P], 'h': [h for _, _, h in P], 'look': looks or [l[1]] * len(ps), 'fov': fov, **o}
    if steady: c = {'steady': True, **c}
    if ease: c['ease'] = ease
    return c, [l[0], l[2]]


def _around(at, ang, dist, y):   # a point `dist` m from the mark `at` in the direction `ang` (deg, 0 = +z), at height y
    a = math.radians(ang)
    return (at[0] + math.sin(a) * dist, y, at[1] + math.cos(a) * dist)


def swoop(path, look, fov=62, roll=(0, -3, -12, -4), hand=0.15, **o):
    """The hook (3-5 s, 6-10 beats): from behind something at the lens (a DJ booth, a shoulder, a railing), high and
    holding, then over it and diving to 15-25 cm off the floor, pushing in on the lead and rolling through the dive.
    path: 4 positions (hold, over the foreground, the dive, the end 1.3-1.6 m from the lead); look: (x, y, z) at
    mid-body. Check every segment clears the foreground by >= 10 cm (the booth's top edge nearly clipped at 5)."""
    return vpath(path, look, fov, looks=[look[1]] * len(path), roll=list(roll), hand=hand, **o)


def low(p0, look, p1, fov=64, roll=(-10, -6), hand=0.3, **o):
    """A deck-level dolly-in: the lens 14-25 cm off the floor, 1.3-3.5 m from the dancers, looking at mid-body (look y
    0.7-0.85), rolled 6-12 deg, pushing ~x1.2-1.5 by the cut. From in front of a line (ang <= ~20 deg) the story's
    place fills the frame behind them; from wider angles it's empty sky."""
    return view(p0, look, fov, p1=p1, roll=list(roll), hand=hand, **o)


def deadpan(at, look_y, dist, cam_y=None, push=0.12, fov=42, ang=0, **o):
    """The watcher's stare: frontal, locked off (no roll, no hand), a narrow lens, a slow linear push of `push` metres.
    at: the mark (x, z); look_y: a bit under the face (Kob seated on her sofa: 0.72-0.8); dist 1.9-2.3 m; ang: the
    direction the watcher faces (0 = +z). A seated Kob at fov 40-44 needs >= 1.8 m or her ears reach the lyrics."""
    cy = look_y + 0.06 if cam_y is None else cam_y
    return view(_around(at, ang, dist, cy), (at[0], look_y, at[1]), fov, p1=_around(at, ang, dist - push, cy), ease='lin', **o)


def orbit(at, r, h, a0, a1, look_y, ly1=None, fov=62, roll=(5, -5), hand=1.2, **o):
    """A handheld low orbit round a solo dancer: r 2.0 m, h ~0.3, from a0 to a1 deg (55-80 deg of arc), linear. The
    look drops with a crouching clip (ly1). At r 1.8 his head reached the lyric rows (the gate, 2026-09-26)."""
    return view(_around(at, a0, r, h), (at[0], look_y, at[1]), fov, p1=_around(at, a1, r, h), ly1=ly1, ease='lin', roll=list(roll), hand=hand, **o)


def backs(at, ang=0, spread=0.63, depth=1.22, right=(0.48, 1.32), cam=(2.4, 2.1, 0.5), look_y=0.85, fov=60, roll=(4, 1), hand=0.35, **o):
    """Between two backs: two characters in the foreground face the lead across the lens (their backs to the camera),
    the lead beyond them. Returns (left_mark, right_mark, yaw, v): place the two with `face='world', yaw=yaw, fg=True`
    (fg: the QA's framing rules skip a body across the lens). Tested for a raise-the-roof on the yacht: at +-0.5 m and
    a 0.62 m lens a head swayed in front of his face; the low lens (0.5) keeps their heads above it. right = (x, z)
    offsets of the right-hand body (it can sit a little closer and inner than the left)."""
    a = math.radians(ang)
    rot = lambda dx, dz: (round(at[0] + dx * math.cos(a) + dz * math.sin(a), 3), round(at[1] - dx * math.sin(a) + dz * math.cos(a), 3))
    left, rgt = rot(-spread, depth), rot(right[0], right[1])
    v = view(_around(at, ang, cam[0], cam[2]), (at[0], look_y, at[1]), fov, p1=_around(at, ang, cam[1], cam[2] - 0.02), roll=list(roll), hand=hand, **o)
    return left, rgt, (ang + 180) % 360, v


def reveal(p0, look, p1, fov=60, roll=(7, 0), hand=0.15, **o):
    """A pull-back reveal: from right over the lead (~1 m) to a high wide (5-6 m back, 3-3.5 m up), linear. Give the
    others `reveal: <s>` (off-frame allowed for their first s seconds) so the gate lets them enter the frame late."""
    return view(p0, look, fov, p1=p1, ease='lin', roll=list(roll), hand=hand, **o)


def topdown(center, h0, h1, fov=56, roll=(0, 12), shift=0.25, **o):
    """Straight down on a group lying on the floor, sinking and turning. center: (x, z) of the middle of the bodies as
    they lie, heads included, not of their marks (the fallen trio on the yacht: (-0.3, -0.25)); the look point sits
    `shift` m towards -z of it and the camera a hair towards +z, so screen-up is -z and the bodies sit under the
    lyrics. From ~5 m down to ~4.2 m; more than ~15 deg of turn swings a body into the lyric rows."""
    x, z = center
    return view((x, h0, z + 0.05), (x, 0.0, z - shift), fov, p1=(x + 0.12, h1, z), ease='lin', roll=list(roll), **o)


def above(head, feet, fov=50, roll=(10, 6), hand=0.5, drift=0.5, **o):
    """A lying body from above, dutch and handheld, drifting across it. head / feet: (x, z) of the top of the head and
    the feet (the chibi head reaches ~0.6 m past the head bone). The body must fit the lower 75% of the frame: the
    camera goes up ~2x the body's length, the look point towards the head."""
    (hx, hz), (fx, fz) = head, feet
    L = math.hypot(fx - hx, fz - hz); cx, cz = (hx + fx) / 2, (hz + fz) / 2
    h = max(2.2, 1.95 * L); ux, uz = (hx - fx) / (L or 1), (hz - fz) / (L or 1)
    lx, lz = cx + ux * 0.28 * L, cz + uz * 0.28 * L
    return view((lx - ux * 0.6 + drift / 2, h, lz - uz * 0.6), (lx, 0.25, lz), fov, p1=(lx - ux * 0.6 - drift / 2, h - 0.05, lz - uz * 0.6), roll=list(roll), hand=hand, **o)
