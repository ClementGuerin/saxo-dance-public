// icons.js: small glyphs for the social links (drawn for this site, 24 × 24; GitHub's is its Octicons mark and X's its
// logo from Simple Icons, CC0, both scaled in)
export const GITHUB_MARK = 'M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8z';   // 16 × 16
export const ICON = {
  tiktok: '<svg viewBox="0 0 24 24"><path d="M16.6 5.8A4.3 4.3 0 0 1 15.5 2.5h-3.1v12.2a2.6 2.6 0 1 1-2.6-2.6c.27 0 .53.04.78.12V9.05A5.8 5.8 0 1 0 15.5 14.7V8.6a7.3 7.3 0 0 0 4.3 1.38V6.9a4.3 4.3 0 0 1-3.2-1.1z"/></svg>',
  instagram: '<svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="5.2" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2.2"/><circle cx="17.4" cy="6.6" r="1.3"/></svg>',
  youtube: '<svg viewBox="0 0 24 24"><path fill-rule="evenodd" d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8zM10 15.1V8.9l5.3 3.1z"/></svg>',
  x: '<svg viewBox="0 0 24 24"><path transform="translate(3 3) scale(.75)" d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/></svg>',
  github: `<svg viewBox="0 0 24 24"><path transform="translate(2 2) scale(1.25)" d="${GITHUB_MARK}"/></svg>`,
};
export const NET = {
  tiktok: { name: 'TikTok', url: 'https://www.tiktok.com/@saxo.dance', handle: '@saxo.dance' },
  instagram: { name: 'Instagram', url: 'https://www.instagram.com/saxo.dance/', handle: '@saxo.dance' },
  youtube: { name: 'YouTube', url: 'https://www.youtube.com/channel/UCkJ-SUUz6dUcAmpfYQ4zZng', handle: 'Saxo Dance' },
  x: { name: 'X', url: 'https://x.com/saxodance', handle: '@saxodance' },
  github: { name: 'GitHub', url: 'https://github.com/ClementGuerin/saxo-dance-public', handle: 'Source code' },
};

// the GitHub mark as hard-edged pixel art, like the pixel icons: filled at n × n (pad px of margin), then every pixel is
// either fg or bg (null: clear), so nothing blurs under nearest-neighbour magnification. The HUD, the markers and the
// GitHub island's screen and signs use it.
export function markPixels(n, fg, bg = null, pad = 0) {
  const c = document.createElement('canvas'); c.width = c.height = n;
  const x = c.getContext('2d'), s = (n - 2 * pad) / 16, rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
  x.setTransform(s, 0, 0, s, pad, pad); x.fill(new Path2D(GITHUB_MARK)); x.setTransform(1, 0, 0, 1, 0, 0);
  const d = x.getImageData(0, 0, n, n), f = rgb(fg), b = bg && rgb(bg);
  for (let i = 0; i < d.data.length; i += 4) {
    const on = d.data[i + 3] >= 128, c3 = on ? f : b;
    if (c3) { d.data[i] = c3[0]; d.data[i + 1] = c3[1]; d.data[i + 2] = c3[2]; d.data[i + 3] = 255; } else d.data[i + 3] = 0;
  }
  x.putImageData(d, 0, 0);
  return c;
}
