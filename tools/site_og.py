#!/usr/bin/env python3
"""The share image, site/assets/og.jpg (1200 × 630): tools/site_og.py [--shot=out/site/og_raw.png]

A wide shot of the diorama (take one at 1200 × 630 with tools/site/shot.mjs, HUD hidden), the site's 8-bit Saxo sticker
bottom left with the loader's hard shadow, and the title and tagline in Fredoka Bold with the site's ink outline and
drop shadow. Re-run after changing the stickers (tools/sticker_pixel.py --site). Pillow only, free.
"""
import sys
from PIL import Image, ImageDraw, ImageFont

opts = dict(a[2:].split('=', 1) for a in sys.argv[1:] if a.startswith('--'))
SHOT, OUT = opts.get('shot', 'out/site/og_raw.png'), 'site/assets/og.jpg'
INK, WHITE, PINK, YELLOW = (42, 22, 54), (255, 255, 255), (255, 95, 162), (255, 212, 59)

def fredoka(size):
    f = ImageFont.truetype('assets/fonts/Fredoka.ttf', size); f.set_variation_by_axes([700, 100]); return f

def fit(parts, width):
    """The font size at which the parts, side by side, are `width` px wide."""
    probe = fredoka(100); d = ImageDraw.Draw(Image.new('RGB', (1, 1)))
    return round(100 * width / sum(d.textlength(s, font=probe) for s, _ in parts))

def title(im, x, y, parts, size, stroke, drop):
    """Coloured runs on one baseline: every run's shadow, then every outline, then the fills, so no run's outline
    covers its neighbour's fill."""
    f = fredoka(size); d = ImageDraw.Draw(im); xs = [x]
    for s, _ in parts: xs.append(xs[-1] + d.textlength(s, font=f))
    for (s, _), xx in zip(parts, xs): d.text((xx + drop, y + drop), s, font=f, fill=INK, stroke_width=stroke, stroke_fill=INK, anchor='ls')
    for (s, _), xx in zip(parts, xs): d.text((xx, y), s, font=f, fill=INK, stroke_width=stroke, stroke_fill=INK, anchor='ls')
    for (s, c), xx in zip(parts, xs): d.text((xx, y), s, font=f, fill=c, anchor='ls')

im = Image.open(SHOT).convert('RGBA').resize((1200, 630), Image.LANCZOS)
sticker = Image.open('assets/ui/pixel/saxo_8bit_32.png').convert('RGBA').resize((192, 192), Image.NEAREST)
shadow = Image.new('RGBA', sticker.size, INK + (0,)); shadow.putalpha(sticker.getchannel('A').point(lambda a: 115 if a else 0))
im.alpha_composite(shadow, (22 + 7, 414 + 8)); im.alpha_composite(sticker, (22, 414))
head = [('saxo', WHITE), ('.dance', PINK)]
title(im, 226, 532, head, fit(head, 520), 7, 6)
tag = [('Play Saxo. Meet the gang. Watch every video.', YELLOW)]
title(im, 230, 594, tag, fit(tag, 826), 5, 4)
im.convert('RGB').save(OUT, quality=88, optimize=True, progressive=True)
print(OUT)
