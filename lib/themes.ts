import type { ThemeId, ThemeOption } from './types';

export const THEMES: ThemeOption[] = [
  { id: 'nokia3310', name: 'Nokia 3310' },
  { id: 'friendster', name: 'Friendster' },
  { id: 'myspace', name: 'Myspace' },
  { id: 'oldfacebook', name: 'Facebook Classic' },
  { id: 'windows95', name: 'Windows 95' },
  { id: 'macos', name: 'macOS' },
  { id: 'windows11', name: 'Windows 11' },
  { id: 'ios18', name: 'iOS 18' },
  { id: 'linux', name: 'Linux' },
  { id: 'twitter', name: 'Twitter' },

  { id: 'spatial_3d', name: 'Spatial / 3D' },
  { id: 'liquid_glass', name: 'Liquid Glass' },
  { id: 'retro_futurism', name: 'Retro-futurism' },
  { id: 'ai_first', name: 'AI-first UX' },
  { id: 'bento_grid', name: 'Bento Grid' },
  { id: 'bordered_minimal', name: 'Bordered Minimalism' },
  { id: 'data_forward', name: 'Data-forward UI' },
  { id: 'dynamic_color', name: 'Dynamic Color' },
  { id: 'micro_interactions', name: 'Micro-interactions' },
  { id: 'sustainable_perf', name: 'Sustainable Performance' },

  { id: 'orkut', name: 'Orkut' },
  { id: 'cyberpunk', name: 'Cyberpunk' },
  { id: 'aurora', name: 'Aurora' },
  { id: 'sunset', name: 'Sunset' },
  { id: 'forest', name: 'Forest' },
  { id: 'midnight', name: 'Midnight' },

  { id: 'glass', name: 'Glass' },
  { id: 'paper', name: 'Paper' },
  { id: 'default', name: 'Default' }
];

export function getThemeById(id: ThemeId): ThemeOption | undefined {
  return THEMES.find((theme) => theme.id === id);
}
