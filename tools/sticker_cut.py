#!/usr/bin/env python3
"""Cut an emoji sticker out of its plain white background: tools/sticker_cut.py <in.png> <out.png> [--w=367]

Flood-fills the near-white background from the image border (so white inside the face, like eye whites or a muzzle,
stays opaque because the dark outline encloses it), feathers the edge by one pixel, trims to the content and scales
to the same width as assets/ui/saxo_sticker.png, then adds the white die-cut border Saxo's sticker has (--border px,
0 = none). Uses Pillow only.
"""
import sys
from collections import deque
from PIL import Image, ImageFilter

args = [a for a in sys.argv[1:] if not a.startswith('--')]
opts = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--'))
src, dst = args
width = int(opts.get('w', 367))
border = int(opts.get('border', 9))

im = Image.open(src).convert('RGBA')
W, H = im.size
px = im.load()
bg = lambda p: min(p[:3]) > 232 and max(p[:3]) - min(p[:3]) < 18   # near-white, unsaturated

mask = Image.new('L', (W, H), 255)
m = mask.load()
q = deque((x, y) for x in range(W) for y in (0, H - 1)) + deque((x, y) for y in range(H) for x in (0, W - 1))
while q:
    x, y = q.popleft()
    if m[x, y] == 0 or not bg(px[x, y]):
        continue
    m[x, y] = 0
    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
        if 0 <= nx < W and 0 <= ny < H and m[nx, ny]:
            q.append((nx, ny))

mask = mask.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(0.8))   # eat the white fringe, soften
im.putalpha(mask)
im = im.crop(mask.point(lambda v: 255 if v > 8 else 0).getbbox())
if border:
    im = im.resize((width - 2 * border, round(im.height * (width - 2 * border) / im.width)), Image.LANCZOS)
    pad = Image.new('RGBA', (im.width + 2 * border, im.height + 2 * border))
    pad.paste(im, (border, border))
    a = pad.getchannel('A').point(lambda v: 255 if v > 40 else 0).filter(ImageFilter.MaxFilter(2 * border + 1)).filter(ImageFilter.GaussianBlur(1))
    white = Image.new('RGBA', pad.size, (255, 255, 255, 255)); white.putalpha(a)
    im = Image.alpha_composite(white, pad)
else:
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
im.save(dst)
print(dst, im.size)
