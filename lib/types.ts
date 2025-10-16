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
  | 'linux';

export interface ThemeOption {
  id: ThemeId;
  name: string;
}
