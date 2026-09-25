#!/usr/bin/env python3
"""16-bit pixel icons for the site and future videos: tools/pixel_icons.py [--out=assets/ui/pixel/icons]

Drawn in code (shapes and small pixel maps, no fonts, no emoji), in the stickers' palette, with the same 1 px ink
outline. Each icon is saved at its native 16 px and magnified ×2 and ×4 with nearest filtering (<name>.png, <name>@2x.png,
<name>@4x.png), plus icons_sheet.png to look at them. tv_hud is the TV button's 32 px TV (the 8-bit stickers' density),
two frames side by side (the screen flickers between them). Pillow only, free.
"""
import math, os, sys
from PIL import Image

opts = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--'))
OUT = opts.get('out', 'assets/ui/pixel/icons')
N = 16
C = {'k': (42, 22, 54), 'w': (255, 255, 255), 'p': (255, 95, 162), 'P': (201, 58, 124), 'y': (255, 212, 59), 'Y': (224, 150, 20),
     'o': (255, 138, 42), 'b': (95, 199, 255), 'B': (47, 134, 201), 'l': (232, 234, 242), 'g': (190, 194, 212), 'G': (125, 129, 150),
     'm': (95, 224, 201), 'M': (40, 160, 140), 'r': (230, 60, 70),
     'd': (66, 64, 84), 'e': (112, 110, 138), 'h': (150, 148, 178),   # the TV's plastic (world.js 0x3b3a48 / 0x55546a, lit)
     'q': (227, 220, 213), 'f': (201, 194, 189), 'F': (162, 156, 158), 'n': (134, 127, 125),   # Saxo's greys (his 8-bit sticker)
     'u': (244, 132, 166), 'U': (204, 88, 124), 'K': (0, 0, 0)}                                  # paw pads, the 8-bit outline

def canvas(w=N, h=N): return [['.'] * w for _ in range(h)]
def from_map(rows): return [list(r.ljust(N, '.')[:N]) for r in (rows + ['.' * N] * N)[:N]]
def outline(g, ink='k'):
    h, w = len(g), len(g[0]); out = [r[:] for r in g]
    for y in range(h):
        for x in range(w):
            if g[y][x] != '.': continue
            if any(0 <= x + dx < w and 0 <= y + dy < h and g[y + dy][x + dx] not in '.k' for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))): out[y][x] = ink
    return out
def save(name, g):
    h, w = len(g), len(g[0])
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); px = im.load()
    for y in range(h):
        for x in range(w):
            if g[y][x] != '.': px[x, y] = C[g[y][x]] + (255,)
    im.save(f'{OUT}/{name}.png')
    for k in (2, 4): im.resize((w * k, h * k), Image.NEAREST).save(f'{OUT}/{name}@{k}x.png')
    return im
def rect(g, x0, y0, x1, y1, c, round_=0):
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            cx, cy = min(x - x0, x1 - x), min(y - y0, y1 - y)
            if cx + cy >= round_: g[y][x] = c
def line(g, x0, y0, x1, y1, c):
    n = max(abs(x1 - x0), abs(y1 - y0))
    for i in range(n + 1): g[round(y0 + (y1 - y0) * i / n)][round(x0 + (x1 - x0) * i / n)] = c

def note(col, shade):
    g = from_map([
        '................',
        '........##......',
        '........####....',
        '........##.##...',
        '........##..##..',
        '........##...#..',
        '........##......',
        '........##......',
        '........##......',
        '....######......',
        '...#######......',
        '..########......',
        '..#######.......',
        '...#####........',
    ])
    for y in range(N):
        for x in range(N):
            if g[y][x] == '#': g[y][x] = shade if (y >= 11 and x <= 4) or (x == 9 and y < 9) else col
    g[10][4] = 'w'; g[10][5] = 'w'; g[11][3] = 'w'
    return outline(g)

def sparkle():
    g = canvas()
    for y in range(N):
        for x in range(N):
            dx, dy = abs(x - 7), abs(y - 7)
            if dx + dy <= 2 or (dx == 0 and dy <= 6) or (dy == 0 and dx <= 6) or (dx <= 1 and dy <= 3) or (dy <= 1 and dx <= 3): g[y][x] = 'y'
    for x, y in ((7, 7), (7, 6), (6, 7), (7, 5), (5, 7)): g[y][x] = 'w'
    for x, y in ((12, 2), (13, 3), (12, 3), (13, 2)): g[y][x] = 'y'
    return outline(g)

def star():
    g = canvas(); cx, cy = 7.5, 8.2
    pts = [(cx + (6.8 if i % 2 == 0 else 2.9) * math.sin(i * math.pi / 5), cy - (6.8 if i % 2 == 0 else 2.9) * math.cos(i * math.pi / 5)) for i in range(10)]
    def inside(x, y):
        c = False
        for i in range(10):
            (x1, y1), (x2, y2) = pts[i], pts[(i + 1) % 10]
            if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1: c = not c
        return c
    for y in range(N):
        for x in range(N):
            if inside(x + 0.5, y + 0.5): g[y][x] = 'Y' if x + 0.5 > cx + 1.5 and y + 0.5 > cy else 'y'
    g[5][6] = 'w'; g[6][6] = 'w'
    return outline(g)

def puff():
    g = canvas()
    for cx, cy, r in ((5.5, 8.5, 3.6), (9.5, 7.2, 3.9), (11.8, 9.6, 2.6), (7.5, 10.2, 3.2)):
        for y in range(N):
            for x in range(N):
                if (x + 0.5 - cx) ** 2 + (y + 0.5 - cy) ** 2 <= r * r: g[y][x] = 'w'
    for y in range(N):
        for x in range(N):
            if g[y][x] == 'w' and (y >= 11 or (y == 10 and x >= 10)): g[y][x] = 'g'
    return outline(g, 'G')

def heart(col='r', shade='P'):
    g = canvas()
    for y in range(N):
        for x in range(N):
            u, v = (x + 0.5 - 8) / 5.9, -(y + 0.5 - 8.4) / 5.9
            if (u * u + v * v - 1) ** 3 - u * u * v ** 3 <= 0: g[y][x] = shade if u > 0.25 and v < -0.2 else col
    g[4][4] = 'w'; g[5][4] = 'w'; g[4][5] = 'w'
    return outline(g)

def mail():
    g = from_map([
        '................',
        '................',
        '................',
        '.##############.',
        '.#o########o##..',
        '.##o######o###..',
        '.###o####o####..',
        '.####o##o#####..',
        '.#####pp######..',
        '.####pppp#####..',
        '.#####pp######..',
        '.##############.',
        '.@@@@@@@@@@@@@@.',
    ])
    g = [[('w' if c == '#' else 'g' if c in 'o@' else c) for c in r] for r in g]
    for r in g:
        if r[14] == '.' and r[1] != '.': r[14] = 'w'
    return outline(g)

def sun():
    g = canvas()
    for y in range(N):
        for x in range(N):
            d = math.hypot(x + 0.5 - 8, y + 0.5 - 8)
            if d <= 4.2: g[y][x] = 'o' if d > 3.2 and (x + y) % 2 == 0 else 'y'
    for a in range(8):
        dx, dy = round(math.sin(a * math.pi / 4)), round(-math.cos(a * math.pi / 4))
        for k in (6, 7):
            x, y = 7 + dx * k if dx >= 0 else 8 + dx * k, 7 + dy * k if dy >= 0 else 8 + dy * k
            if 0 <= x < N and 0 <= y < N: g[y][x] = 'y'
    g[6][6] = 'w'; g[6][7] = 'w'; g[7][6] = 'w'
    return outline(g)

def disco():
    g = canvas()
    for y in range(1, 3): g[y][7] = 'G'
    for y in range(N):
        for x in range(N):
            d = math.hypot(x + 0.5 - 8, y + 0.5 - 9)
            if d <= 5.8:
                shade = 'w' if (x + y) % 2 == 0 and x < 7 and y < 8 else 'l' if (x + y) % 2 == 0 else 'g' if x < 9 else 'G'
                g[y][x] = shade
    g[5][5] = 'w'; g[6][6] = 'w'
    for x, y in ((14, 3), (13, 4), (14, 4), (15, 4), (14, 5)): g[y][x] = 'y'
    return outline(g)

def talk():
    g = canvas()
    for y in range(3, 12):
        for x in range(1, 15):
            if not ((y in (3, 11)) and (x in (1, 14))): g[y][x] = 'w'
    for x, y in ((4, 12), (5, 12), (4, 13)): g[y][x] = 'w'
    for x0 in (4, 7, 10):
        for dx in range(2):
            for dy in range(2): g[6 + dy][x0 + dx] = 'k'
    return outline(g)

def alert():
    g = canvas()
    for y in range(2, 10):
        for x in range(7, 9): g[y][x] = 'y'
    for y in range(11, 13):
        for x in range(7, 9): g[y][x] = 'y'
    return outline(g)

def play():
    g = canvas()
    for y in range(3, 13):
        w = 6 - abs(y - 7.5) * 1.2
        for x in range(5, 5 + max(0, int(round(w * 1.4)))): g[y][x] = 'p'
    return outline(g)

def screen(g, x0, y0, x1, y1, cols, glint=True):
    """The CRT picture: a diagonal two-colour gradient, checker-dithered where the colours meet, and a glint."""
    w, h = x1 - x0 + 1, y1 - y0 + 1
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            t = ((x - x0) / w + (y - y0) / h) / 2
            g[y][x] = cols[0] if t < 0.42 else cols[1] if t > 0.58 else cols[(x + y) % 2]
    if glint:
        for i in range(min(3, h - 1)): g[y0 + i][x0 + 1 + (2 - i) // 2] = 'w'

def tv():
    """16 px: the in-game TV, front on (marker above the TV)."""
    g = canvas()
    rect(g, 2, 5, 13, 14, 'd', 1)
    rect(g, 3, 6, 12, 12, 'k'); screen(g, 4, 7, 11, 11, 'pb', glint=False); g[7][4] = 'w'
    for x in range(4, 12): g[13][x] = 'e'
    g[13][4] = g[13][5] = 'y'
    rect(g, 6, 4, 9, 4, 'e')
    line(g, 6, 3, 4, 1, 'k'); line(g, 9, 3, 11, 1, 'k')
    return outline(g)

def tv_hud(cols):
    """32 px: the TV button's TV. Same build as the in-game one: dark body, bevel, a 4:3 screen with a play mark, the
    lighter strip under it with the yellow SAXO TV logo, a box on top with two antennas, two feet."""
    g = canvas(32, 32)
    rect(g, 4, 10, 27, 28, 'd', 2)
    for x in range(6, 26): g[10][x] = 'e'              # bevel: lit top edge
    for y in range(12, 27): g[y][4] = 'e'              # and left edge
    rect(g, 6, 12, 25, 25, 'k', 1)                     # screen bezel
    screen(g, 7, 13, 24, 24, cols)                     # 18 × 12
    for dy in range(-4, 5):                            # play mark, 9 tall
        for x in range(14, 14 + 5 - abs(dy)): g[19 + dy][x] = 'w'
    for x in range(7, 25): g[26][x] = 'e'
    for x in range(8, 12): g[26][x] = 'y'              # the SAXO TV logo
    g[26][21] = g[26][23] = 'h'                        # buttons
    rect(g, 13, 8, 18, 9, 'e')                         # antenna box
    line(g, 14, 7, 10, 3, 'e'); line(g, 17, 7, 21, 3, 'e')
    rect(g, 9, 1, 10, 2, 'h'); rect(g, 21, 1, 22, 2, 'h')
    rect(g, 8, 29, 10, 29, 'e'); rect(g, 21, 29, 23, 29, 'e')
    return outline(g)

PAW = [   # a paw print, hand-drawn (fills only; outline() adds the black): two inner toes, two outer toes, the palm
    '....#...#....',
    '...###.###...',
    '...###.###...',
    '.#..#...#..#.',
    '###.......###',
    '###..###..###',
    '.#..#####..#.',
    '...#######...',
    '...#######...',
    '...#######...',
    '....##.##....',
]

def paw(boop=False):
    """16 px: Saxo's paw print for the desktop cursor (→ site/assets/ui/cursor/), in his grey with the 8-bit stickers'
    black outline, upright (a leaning version sheared the beans out of shape). The hotspot is the top of the left inner
    toe (hotspot()). boop, over something clickable: pink beans and a tap spark by that toe."""
    fill, shade, lit = ('p', 'P', 'w') if boop else ('f', 'F', 'q')
    g = canvas()
    for r, row in enumerate(PAW):
        for k, ch in enumerate(row):
            if ch == '#': g[r + 3][k + 1] = fill
    # 8-bit shading: the palm's right and bottom rim darker, one lit pixel at the top-left of every pad
    seen = set()
    for y in range(N):
        for x in range(N):
            if g[y][x] != fill or (x, y) in seen: continue
            pad, st = [], [(x, y)]
            while st:
                px_, py_ = st.pop()
                if (px_, py_) in seen or not (0 <= px_ < N and 0 <= py_ < N) or g[py_][px_] != fill: continue
                seen.add((px_, py_)); pad.append((px_, py_)); st += [(px_ + 1, py_), (px_ - 1, py_), (px_, py_ + 1), (px_, py_ - 1)]
            ps = set(pad)
            if len(pad) > 12:
                for qx, qy in pad:
                    if (qx + 1, qy) not in ps or (qx, qy + 1) not in ps: g[qy][qx] = shade
            tx, ty = min(pad, key=lambda p: (p[1], p[0])); g[ty][tx] = lit
    g = outline(g, 'K')
    if boop:
        hx, hy = hotspot(g)
        for dx, dy in ((-3, 0), (-2, -1), (0, -3), (1, -2)):
            if 0 <= hx + dx < N and 0 <= hy + dy < N and g[hy + dy][hx + dx] == '.': g[hy + dy][hx + dx] = 'y'
    return g

def hotspot(g):
    return min(((x, y) for y in range(len(g)) for x in range(len(g[0])) if g[y][x] not in '.y'), key=lambda p: (p[0] + p[1], p[1]))

def main():
    os.makedirs(OUT, exist_ok=True)
    icons = {'note_pink': note('p', 'P'), 'note_yellow': note('y', 'Y'), 'note_blue': note('b', 'B'), 'sparkle': sparkle(), 'star': star(),
             'puff': puff(), 'heart': heart(), 'mail': mail(), 'sun': sun(), 'disco': disco(), 'talk': talk(), 'alert': alert(), 'play': play(),
             'tv': tv()}
    ims = [save(n, g) for n, g in icons.items()]
    a, b = tv_hud('pb'), tv_hud('yp')                   # the flicker: pink→sky, then yellow→pink
    save('tv_hud', [ra + rb for ra, rb in zip(a, b)])
    p0, p1 = paw(), paw(True); save('paw', p0); save('paw_boop', p1)
    print('paw hotspot (native px):', hotspot(p0))   # style.css uses 2x + 1 (the tip pixel's centre in the 32 px file)
    sheet = Image.new('RGBA', (len(ims) * 72 + 8, 80), (255, 95, 162, 255))
    for i, im in enumerate(ims): sheet.alpha_composite(im.resize((64, 64), Image.NEAREST), (8 + i * 72, 8))
    sheet.save(f'{OUT}/icons_sheet.png')
    print(f'{len(ims)} icons → {OUT}/ (icons_sheet.png)')

if __name__ == '__main__':
    main()
