/**
 * Background theme registry — swatch values here are reused as inline
 * previews in the theme picker; the matching full textures live in
 * src/styles/themes.css keyed by the same [data-theme] id.
 */
import { ThemeId } from '@/types/scrapbook';

export interface ThemeDef {
  id: ThemeId;
  label: string;
  emoji: string;
  swatch: string;
}

export const THEMES: ThemeDef[] = [
  { id: 'paper', label: 'Paper', emoji: '📜', swatch: 'linear-gradient(160deg, #f5f1e8 0%, #ede7da 55%, #d9c9b2 100%)' },
  { id: 'water', label: 'Water', emoji: '🌊', swatch: 'linear-gradient(160deg, #bfe1e8 0%, #8ec3d6 45%, #5fa3c4 100%)' },
  { id: 'grid', label: 'Grid', emoji: '📐', swatch: 'linear-gradient(160deg, #fbfaf6 0%, #f4f1ea 100%)' },
  { id: 'fire', label: 'Fire', emoji: '🔥', swatch: 'linear-gradient(160deg, #ffb347 0%, #ff7b54 45%, #d1495b 100%)' },
  { id: 'romance', label: 'Romance', emoji: '💗', swatch: 'linear-gradient(150deg, #f6d3d9 0%, #eeb9c4 50%, #dda0ae 100%)' },
  { id: 'meadow', label: 'Meadow', emoji: '🌿', swatch: 'linear-gradient(160deg, #cfe3b8 0%, #a9c98f 50%, #7fac6c 100%)' },
  { id: 'dream', label: 'Dream', emoji: '✨', swatch: 'linear-gradient(165deg, #4b3a72 0%, #5b4a8f 45%, #7a5fa8 100%)' },
];

export const DEFAULT_THEME: ThemeId = 'paper';
