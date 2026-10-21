/**
 * AIken design tokens (from the Figma file "Aiken - UI/UX", collections Theme · Light / Theme · Dark).
 * useColors() picks the palette that matches the device appearance.
 */
const light = {
  // Brand
  red: '#D63A2C',
  redDeep: '#C42F25',
  redSoft: '#F0624A',
  yellow: '#F6C95C',
  ink: '#0B0B0B',
  cream: '#FDFBF7',
  green: '#2E9E5B',

  // Semantic
  bg: '#FDFBF7',
  text: '#0B0B0B',
  muted: '#5A4B42',
  accentText: '#D63A2C',
  surface: 'rgba(255,255,255,0.55)',
  surfaceStrong: 'rgba(255,255,255,0.85)',
  border: 'rgba(255,255,255,0.8)',
  track: 'rgba(255,255,255,0.45)',
  divider: 'rgba(11,11,11,0.08)',
  sheet: 'rgba(255,250,245,0.98)',
  scrim: 'rgba(11,11,11,0.40)',
  yellowSoft: 'rgba(246,201,92,0.55)',
  onYellow: '#0B0B0B',
  yellowPill: 'rgba(246,201,92,0.75)',
  inputBg: '#FFFFFF',
  inputBorder: 'rgba(246,201,92,0.7)',
  errorBg: 'rgba(214,58,44,0.10)',
  errorBorder: 'rgba(214,58,44,0.45)',
  inkButton: '#0B0B0B',
  onInkButton: '#FDFBF7',
  glowA: 'rgba(214,58,44,0.45)',
  glowB: 'rgba(246,201,92,0.75)',
  glowC: 'rgba(240,98,74,0.35)',
  blurTint: 'light' as 'light' | 'dark',

  // Legacy aliases used by older components
  tint: '#D63A2C',
  background: '#FDFBF7',
  foreground: '#0B0B0B',
  card: '#FFFFFF',
  cardForeground: '#0B0B0B',
  primary: '#D63A2C',
  primaryForeground: '#FFFFFF',
  secondary: '#FFF1D8',
  secondaryForeground: '#0B0B0B',
  mutedForeground: '#5A4B42',
  accent: '#F6C95C',
  accentForeground: '#0B0B0B',
  destructive: '#D63A2C',
  destructiveForeground: '#FFFFFF',
  input: 'rgba(246,201,92,0.7)',
};

export type Palette = typeof light;

const dark: Palette = {
  ...light,
  bg: '#0B0B0B',
  text: '#F7EFE7',
  muted: '#CDBFB2',
  accentText: '#FF6B57',
  surface: 'rgba(255,255,255,0.075)',
  surfaceStrong: 'rgba(255,255,255,0.12)',
  border: 'rgba(255,255,255,0.14)',
  track: 'rgba(255,255,255,0.08)',
  divider: 'rgba(255,255,255,0.12)',
  sheet: 'rgba(28,23,21,0.98)',
  scrim: 'rgba(0,0,0,0.55)',
  yellowSoft: 'rgba(246,201,92,0.18)',
  onYellow: '#F6C95C',
  yellowPill: 'rgba(246,201,92,0.85)',
  inputBg: 'rgba(255,255,255,0.08)',
  inputBorder: 'rgba(246,201,92,0.35)',
  errorBg: 'rgba(255,107,87,0.12)',
  errorBorder: 'rgba(255,107,87,0.5)',
  inkButton: '#F7EFE7',
  onInkButton: '#0B0B0B',
  glowA: 'rgba(217,58,46,0.62)',
  glowB: 'rgba(246,201,92,0.34)',
  glowC: 'rgba(240,98,74,0.48)',
  blurTint: 'dark',

  tint: '#FF6B57',
  background: '#0B0B0B',
  foreground: '#F7EFE7',
  card: '#1C1715',
  cardForeground: '#F7EFE7',
  secondary: '#2A211D',
  secondaryForeground: '#F7EFE7',
  mutedForeground: '#CDBFB2',
};

const colors = { light, dark, radius: 14 };
export default colors;
