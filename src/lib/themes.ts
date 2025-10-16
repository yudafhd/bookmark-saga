import type { ThemeId, ThemeOption } from './types';

export const THEMES: ThemeOption[] = [
  {
    id: 'default',
    name: 'Default',
    description: 'Palet terang lembut yang terinspirasi tampilan standar.',
  },
  {
    id: 'ios18',
    name: 'iOS 18',
    description: 'Gradien warna neon dan panel berkilau ala iOS 18.',
  },
  {
    id: 'glass',
    name: 'Glass',
    description: 'Efek glassmorphism dengan blur transparan modern.',
  },
  {
    id: 'aurora',
    name: 'Aurora',
    description: 'Garis cahaya hijau kebiruan seperti langit kutub.',
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Nuansa gelap biru dengan aksen neon untuk fokus malam.',
  },
  {
    id: 'neobrutalism',
    name: 'Neo Brutalism',
    description: 'Warna bold dengan border tebal khas neo-brutalism.',
  },
  {
    id: 'windows95',
    name: 'Windows 95',
    description: 'Retro UI 90-an dengan bevel 3D klasik.',
  },
  {
    id: 'windows11',
    name: 'Windows 11',
    description: 'Efek mica, warna lembut, dan blur ala Windows 11.',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    description: 'Kontras tinggi dengan neon magenta dan cyan.',
  },
  {
    id: 'paper',
    name: 'Paper',
    description: 'Minimal putih krem seperti lembaran kertas.',
  },
];

export function getThemeById(id: ThemeId): ThemeOption | undefined {
  return THEMES.find((theme) => theme.id === id);
}
