export interface VisitEntry {
  url: string;
  title: string;
  visitTime: number;
  faviconUrl: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
}

export interface FolderItem {
  url: string;
  title: string;
  faviconUrl: string;
  savedAt: number;
  visitTime: number | null;
}

export type FolderItemsMap = Record<string, FolderItem[]>;

export type ThemeId =
  | 'default'
  | 'ios18'
  | 'glass'
  | 'aurora'
  | 'midnight'
  | 'neobrutalism'
  | 'windows95'
  | 'windows11'
  | 'cyberpunk'
  | 'sunset'
  | 'paper'
  | 'macos'
  | 'linux'
  | 'forest'
  | 'twitter'
  | 'friendster'
  | 'oldfacebook'
  | 'myspace'
  | 'orkut'
  | 'spatial_3d'
  | 'bento_grid'
  | 'liquid_glass'
  | 'ai_first'
  | 'dynamic_color'
  | 'fluent_refresh'
  | 'a11y_first'
  | 'micro_interactions'
  | 'retro_futurism'
  | 'bordered_minimal'
  | 'data_forward'
  | 'sustainable_perf'
  | 'nokia3310';

export interface ThemeOption {
  id: ThemeId;
  name: string;
}

export interface Note {
  id: string;
  content: string;
  color: NoteColor;
  category: string;
  createdAt: number;
  updatedAt: number;
}

export type NoteColor =
  | 'white'
  | 'yellow'
  | 'blue'
  | 'green'
  | 'red';

export type NotesMap = Record<string, Note[]>;
