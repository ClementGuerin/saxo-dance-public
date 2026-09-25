#!/usr/bin/env python3
"""Pixel-art versions of the emoji stickers: tools/sticker_pixel.py [saxo sadi kob compote] [--out=assets/ui/pixel]

  16-bit: a 64 px sprite, 26 colours picked from the sticker (SNES-like), the white die-cut ring kept, ink outline.
  8-bit:  a 32 px sprite, 9 punchier colours + black, no ring, black outline (NES-sprite feel). 32 px so the site
          shows it at exact multiples (1×, 2×, 4× at 32/64/128 px) on every screen density.

Each is saved at its native size (<name>_16bit_64.png, <name>_8bit_32.png) and magnified with nearest filtering to
512 px (<name>_16bit.png, <name>_8bit.png), plus a side-by-side sheet (pixel_sheet.png). Pillow only, free.
  --site=8|16  install that set as the site's stickers (site/assets/ui/<name>.png at 128 px, favicon.png at 64 px).
               The site uses the 8-bit set (the user's call, 2026-09-25: 16-bit read too HD next to the PS1 world).
  --portraits --src=<renders> --out=<dir> [--bits=8|16] names…  the wardrobe's portraits (tools/site_portraits.mjs).
How: a Lanczos reduction gives the colours (saturation pushed, then an adaptive palette), and the cartoon's ink lines
are tracked separately at full size: a sprite pixel whose block is ~25-30% ink becomes ink, so outlines, pupils and
brows survive the reduction instead of averaging into grey. (Snapping to the real NES palette was tried: it turned the
grey faces to mud and lost the eyes.)
"""
import os, sys
from collections import Counter
from PIL import Image

args = [a for a in sys.argv[1:] if not a.startswith('--')] or ['saxo', 'sadi', 'kob', 'compote']
opts = dict((a[2:].split('=', 1) + [''])[:2] for a in sys.argv[1:] if a.startswith('--'))
OUT = opts.get('out', 'assets/ui/pixel')

# the NES (2C02) palette, the usual emulator rendering, minus the duplicate blacks
NES = ['7c7c7c', '0000fc', '0000bc', '4428bc', '940084', 'a80020', 'a81000', '881400', '503000', '007800', '006800', '005800',
       '004058', 'bcbcbc', '0078f8', '0058f8', '6844fc', 'd800cc', 'e40058', 'f83800', 'e45c10', 'ac7c00', '00b800', '00a800',
       '00a844', '008888', 'f8f8f8', '3cbcfc', '6888fc', '9878f8', 'f878f8', 'f85898', 'f87858', 'fca044', 'f8b800', 'b8f818',
       '58d854', '58f898', '00e8d8', '787878', 'fcfcfc', 'a4e4fc', 'b8b8f8', 'd8b8f8', 'f8b8f8', 'f8a4c0', 'f0d0b0', 'fce0a8',
       'f8d878', 'd8f878', 'b8f8b8', 'b8f8d8', '00fcfc', 'f8d8f8', '000000']
NES = [tuple(int(h[i:i + 2], 16) for i in (0, 2, 4)) for h in NES]
INK = (26, 20, 32)
EIGHT = dict(ring=False, outline=(0, 0, 0), ink_t=0.4, sat=1.45, whites=0.26)   # the 8-bit look: 32 px, 9 colours

def kmeans(img, k, iters=12):
    """Weighted k-means palette: vivid colours (a bow, a carrot, yellow eyes) and eye whites weigh more, so a few
    pixels of them still get their own entry instead of being averaged away as median cut does."""
    import random
    random.seed(7)
    hist = Counter(img.get_flattened_data())
    px = list(hist); w = []
    for c in px:
        sat = (max(c) - min(c)) / 255
        w.append(hist[c] * (1 + 8 * sat * sat) * (4 if luma(c) > 215 else 1))
    centers = [px[max(range(len(px)), key=lambda i: w[i])]]
    d2 = [dist(c, centers[0]) for c in px]
    while len(centers) < min(k, len(px)):
        tot = sum(a * b for a, b in zip(w, d2)); r = random.random() * tot; acc = 0
        for c, a, b in zip(px, w, d2):
            acc += a * b
            if acc >= r: centers.append(c); break
        else: break
        d2 = [min(d, dist(c, centers[-1])) for d, c in zip(d2, px)]
    for _ in range(iters):
        sums = [[0.0, 0.0, 0.0, 0.0] for _ in centers]
        for c, a in zip(px, w):
            i = min(range(len(centers)), key=lambda j: dist(c, centers[j])); t = sums[i]
            t[0] += c[0] * a; t[1] += c[1] * a; t[2] += c[2] * a; t[3] += a
        centers = [(t[0] / t[3], t[1] / t[3], t[2] / t[3]) if t[3] else c for t, c in zip(sums, centers)]
    centers = [tuple(int(round(v)) for v in c) for c in centers]
    lut = {c: min(centers, key=lambda z: dist(c, z)) for c in px}
    out = Image.new('RGB', img.size); out.putdata([lut[c] for c in img.get_flattened_data()]); return out

def luma(c): return 0.299 * c[0] + 0.587 * c[1] + 0.114 * c[2]
def dist(a, b):   # weighted RGB distance, closer to what the eye sees than plain RGB
    r = (a[0] + b[0]) / 2
    return (2 + r / 256) * (a[0] - b[0]) ** 2 + 4 * (a[1] - b[1]) ** 2 + (2 + (255 - r) / 256) * (a[2] - b[2]) ** 2

def square(im):
    im = im.crop(im.getchannel('A').getbbox())
    s = max(im.size) + 8
    sq = Image.new('RGBA', (s, s), (0, 0, 0, 0)); sq.paste(im, ((s - im.width) // 2, (s - im.height) // 2)); return sq

def sprite(im, size, colors, ring=True, outline=INK, ink_t=0.3, sat=1.3, whites=0, ink_luma=62):
    from PIL import ImageEnhance, ImageFilter
    src = im
    if not ring:   # drop the white die-cut ring: shrink the silhouette by the ring's width (9 px at 367 px)
        a = im.getchannel('A').filter(ImageFilter.MinFilter(23)); src = im.copy(); src.putalpha(a)
    # the cartoon's ink (outlines, pupils, brows): dark source pixels, kept as a separate map so they stay black
    L = src.convert('L'); ap = src.getchannel('A')
    inkmask = Image.eval(L, lambda v: 255 if v < ink_luma else 0); inkmask.paste(0, mask=Image.eval(ap, lambda v: 255 if v < 128 else 0))
    ink = inkmask.resize((size, size), Image.BOX).load()
    solid = ap.resize((size, size), Image.BOX).load()
    # eye whites and teeth: small and bright, they vanish between the ink first, so blocks that are partly white keep it
    wmask = Image.eval(L, lambda v: 255 if v > 232 else 0); wmask.paste(0, mask=Image.eval(ap, lambda v: 255 if v < 128 else 0))
    white = wmask.resize((size, size), Image.BOX).load()
    small = src.convert('RGBa').resize((size, size), Image.LANCZOS).convert('RGBA')
    rgb = Image.new('RGB', small.size, (255, 255, 255)); rgb.paste(small, mask=small.getchannel('A'))
    rgb = ImageEnhance.Contrast(ImageEnhance.Color(rgb).enhance(sat)).enhance(1.08)
    qi = kmeans(rgb, colors); q = qi.load(); lightest = max(set(qi.get_flattened_data()), key=luma)
    out = Image.new('RGBA', (size, size), (0, 0, 0, 0)); op = out.load()
    for y in range(size):
        for x in range(size):
            if solid[x, y] < 128: continue
            if whites and white[x, y] >= whites * 255 and ink[x, y] < 0.6 * 255: op[x, y] = lightest + (255,)
            else: op[x, y] = (outline if ink[x, y] >= ink_t * 255 else q[x, y]) + (255,)
    # tidy: a lone pixel whose four neighbours all share one other colour takes it (ink stays: pupils are single pixels)
    snap = out.copy(); sp = snap.load()
    for y in range(1, size - 1):
        for x in range(1, size - 1):
            c = sp[x, y]
            if c[3] == 0 or c[:3] == outline: continue
            nb = [sp[x - 1, y], sp[x + 1, y], sp[x, y - 1], sp[x, y + 1]]
            if nb[0] != c and nb[0][3] and all(v == nb[0] for v in nb): op[x, y] = nb[0]
    # 1 px outline outside the silhouette
    snap = out.copy(); sp = snap.load()
    for y in range(size):
        for x in range(size):
            if sp[x, y][3]: continue
            if any(0 <= x + dx < size and 0 <= y + dy < size and sp[x + dx, y + dy][3] for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1))):
                op[x, y] = outline + (255,)
    return out

def ring(im, px=11):
    """The stickers' white die-cut border, for renders that don't have one (the wardrobe portraits)."""
    from PIL import ImageFilter
    a = im.getchannel('A').point(lambda v: 255 if v >= 128 else 0)
    grown = a.filter(ImageFilter.MaxFilter(2 * px + 1))
    out = Image.new('RGBA', im.size, (0, 0, 0, 0)); out.paste((255, 255, 255, 255), mask=grown); out.alpha_composite(im)
    return out

def portraits():
    """--portraits --src=<dir of renders> --out=<dir> [--bits=8|16] names…: 128 px icons for the site, 8-bit (32 px ×4,
    like the site's stickers) or 16-bit (64 px ×2, with the stickers' white ring)."""
    os.makedirs(OUT, exist_ok=True)
    bits = opts.get('bits', '8')
    for name in args:
        im = Image.open(f"{opts['src']}/{name}.png").convert('RGBA')
        bbox = im.getchannel('A').getbbox(); im = im.crop(bbox)
        pad = 24; sq = Image.new('RGBA', (max(im.size) + 2 * pad,) * 2, (0, 0, 0, 0)); sq.paste(im, ((sq.width - im.width) // 2, (sq.height - im.height) // 2))
        # renders have no cartoon lines, so only true blacks are ink (ink_luma); ring=True: nothing to erode. For 8-bit the
        # render is lifted 12% and barely saturated: the scene's lavender ambient turned the greys purple at 1.45
        if bits == '8':
            from PIL import ImageEnhance
            a = sq.getchannel('A'); lit = ImageEnhance.Brightness(sq.convert('RGB')).enhance(1.12).convert('RGBA'); lit.putalpha(a)
            sp = sprite(lit, 32, 10, **{**EIGHT, 'ring': True, 'sat': 1.1}, ink_luma=34)
        else: sp = sprite(ring(sq), 64, 24, ink_t=0.35, ink_luma=34, sat=1.2)
        sp.save(f"{os.path.dirname(opts['src'].rstrip('/'))}/{name}_{sp.width}.png")   # native size, next to the renders (not shipped)
        sp.resize((128, 128), Image.NEAREST).save(f'{OUT}/{name}.png')
        print(f'{name}: {bits}-bit, {len({p for p in sp.get_flattened_data() if p[3]})} colours')

def site(bits):
    """--site=8|16: copy a set into the site at 128 px (the files the page expects), and Saxo as the favicon."""
    for name in args:
        sp = Image.open(f'{OUT}/{name}_{"8bit_32" if bits == "8" else "16bit_64"}.png')
        sp.resize((128, 128), Image.NEAREST).save(f'site/assets/ui/{name}.png')
        if name == 'saxo': sp.resize((64, 64), Image.NEAREST).save('site/assets/ui/favicon.png')
    print(f'site stickers: {bits}-bit ({", ".join(args)})')

def main():
    import os
    os.makedirs(OUT, exist_ok=True)
    rows = []
    for name in args:
        im = square(Image.open(f'assets/ui/{name}_sticker.png').convert('RGBA'))
        s16 = sprite(im, 64, 26, ink_t=0.3); s8 = sprite(im, 32, 9, **EIGHT)
        s16.save(f'{OUT}/{name}_16bit_64.png'); s8.save(f'{OUT}/{name}_8bit_32.png')
        big16 = s16.resize((512, 512), Image.NEAREST); big8 = s8.resize((512, 512), Image.NEAREST)
        big16.save(f'{OUT}/{name}_16bit.png'); big8.save(f'{OUT}/{name}_8bit.png')
        colors16 = len({p for p in s16.get_flattened_data() if p[3]}); colors8 = len({p for p in s8.get_flattened_data() if p[3]})
        print(f'{name}: 16-bit {colors16} colours, 8-bit {colors8} colours')
        rows.append((im.resize((256, 256), Image.LANCZOS), big16.resize((256, 256), Image.NEAREST), big8.resize((256, 256), Image.NEAREST)))
    sheet = Image.new('RGBA', (3 * 272 + 16, len(rows) * 272 + 16), (255, 95, 162, 255))
    for r, cells in enumerate(rows):
        for c, cell in enumerate(cells): sheet.alpha_composite(cell, (16 + c * 272, 16 + r * 272))
    sheet.convert('RGB').save(f'{OUT}/pixel_sheet.png')
    print(f'{OUT}/pixel_sheet.png (columns: original, 16-bit, 8-bit)')

if __name__ == '__main__':
    if 'portraits' in opts: portraits()
    elif 'site' in opts: site(opts['site'])
    else: main()
