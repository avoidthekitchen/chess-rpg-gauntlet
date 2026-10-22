/** Colors and type shared by every screen. Same palette as the battle prototype. */
export const C = {
  bg: 0x15121a,
  surface: 0x211c27,
  surface2: 0x2c2533,
  line: 0x3d3446,
  ink: 0xf0e7d4,
  muted: 0xb3a88f,
  gold: 0xe0ab45,
  goldInk: 0x1d1505,
  red: 0xe25a43,
  green: 0x79c27c,
  bog: 0x8fb04a,
} as const;

/** CSS strings for Text styles. */
export const CSS = {
  ink: '#f0e7d4',
  muted: '#b3a88f',
  gold: '#e0ab45',
  goldInk: '#1d1505',
  red: '#ff8a73',
  green: '#9ad27c',
  bog: '#b5d36a',
} as const;

export const SERIF = 'Alegreya, "Iowan Old Style", Palatino, Georgia, serif';
export const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
export const GLYPH_FONT = '"Segoe UI Symbol", "Noto Sans Symbols 2", "Apple Symbols", "DejaVu Sans", serif';
