import type { ThemeId, ThemeOption } from './types';

export const THEMES: ThemeOption[] = [
  {
    id: 'default',
    name: 'Default',
  },
  {
    id: 'ios18',
    name: 'iOS 18',
  },
  {
    id: 'glass',
    name: 'Glass',
  },
  {
    id: 'aurora',
    name: 'Aurora',
  },
  {
    id: 'midnight',
    name: 'Midnight',
  },
  {
    id: 'neobrutalism',
    name: 'Neo Brutalism',
  },
  {
    id: 'windows95',
    name: 'Windows 95',
  },
  {
    id: 'windows11',
    name: 'Windows 11',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
  },
  {
    id: 'sunset',
    name: 'Sunset',
  },
  {
    id: 'paper',
    name: 'Paper',
  },
  {
    id: 'macos',
    name: 'macOS',
  },
  {
    id: 'linux',
    name: 'Linux',
  },
];

export function getThemeById(id: ThemeId): ThemeOption | undefined {
  return THEMES.find((theme) => theme.id === id);
}
