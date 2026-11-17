// Static configuration shared across the app.

export const LANGUAGES = [
  { code: 'en', label: 'EN', dir: 'ltr' },
  { code: 'fr', label: 'FR', dir: 'ltr' },
  { code: 'ar', label: 'AR', dir: 'rtl' },
];

// `css` is a CSS value assigned to --bg-image on the root container.
// The actual gradients live in src/styles/variables.css.
export const WALLPAPERS = [
  { id: 'fantasy', css: 'var(--wallpaper-fantasy)' },
  { id: 'pastel', css: 'var(--wallpaper-pastel)' },
  { id: 'lofi', css: 'var(--wallpaper-lofi)' },
  { id: 'cyberpunk', css: 'var(--wallpaper-cyberpunk)' },
];

export const ACCENT_COLORS = [
  { id: 'sky', value: '#70A5FF' },
  { id: 'lavender', value: '#B392F0' },
  { id: 'mint', value: '#2EC4B6' },
  { id: 'lime', value: '#B5F23D' },
  { id: 'coral', value: '#FF6B6B' },
  { id: 'gold', value: '#FFD166' },
];

export const AMBIENT_OPTIONS = ['none', 'rain', 'embers', 'glow'];

export const DEFAULT_SETTINGS = {
  focus: 25,
  short: 5,
  long: 15,
  autoStartBreaks: false,
  autoStartFocus: false,
};

export const DEFAULT_AESTHETICS = {
  timerStyle: 'ring', // 'ring' | 'numbers'
  wallpaper: 'cyberpunk', // wallpaper id or 'custom'
  accent: '#B5F23D',
  ambient: 'none', // 'none' | 'rain' | 'embers' | 'glow'
};

// Spotify "Lofi Beats" playlist, pre-loaded so music works out of the box.
export const DEFAULT_SPOTIFY_URL =
  'https://open.spotify.com/playlist/37i9dQZF1DWWQRwui0ExPn';
