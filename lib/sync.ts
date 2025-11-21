import {
  BOOKMARK_ITEMS_KEY,
  FOLDERS_KEY,
  MAX_ITEMS_KEY,
  THEME_KEY,
  TOUR_SEEN_KEY,
  VISITS_KEY,
  NOTES_KEY,
} from './constants';
import type { Folder, FolderItemsMap, ThemeId, VisitEntry, Note } from './types';

export interface SyncPayloadV1 {
  version: 1;
  exportedAt: number;
  data: {
    [VISITS_KEY]: VisitEntry[];
    [MAX_ITEMS_KEY]: number;
    [FOLDERS_KEY]: Folder[];
    [BOOKMARK_ITEMS_KEY]: FolderItemsMap;
    [THEME_KEY]: ThemeId;
    [TOUR_SEEN_KEY]: boolean;
    [NOTES_KEY]: Note[];
  };
}

export type SyncPayload = SyncPayloadV1;

export async function exportAll(): Promise<SyncPayload> {
  const result = await chrome.storage.local.get({
    [VISITS_KEY]: [] as VisitEntry[],
    [MAX_ITEMS_KEY]: 50 as number,
    [FOLDERS_KEY]: [] as Folder[],
    [BOOKMARK_ITEMS_KEY]: {} as FolderItemsMap,
    [THEME_KEY]: 'midnight' as ThemeId,
    [TOUR_SEEN_KEY]: false as boolean,
    [NOTES_KEY]: [] as Note[],
  });

  const payload: SyncPayloadV1 = {
    version: 1,
    exportedAt: Date.now(),
    data: {
      [VISITS_KEY]: Array.isArray(result[VISITS_KEY]) ? result[VISITS_KEY] : [],
      [MAX_ITEMS_KEY]: typeof result[MAX_ITEMS_KEY] === 'number' ? result[MAX_ITEMS_KEY] : 50,
      [FOLDERS_KEY]: Array.isArray(result[FOLDERS_KEY]) ? result[FOLDERS_KEY] : [],
      [BOOKMARK_ITEMS_KEY]: typeof result[BOOKMARK_ITEMS_KEY] === 'object' && result[BOOKMARK_ITEMS_KEY]
        ? (result[BOOKMARK_ITEMS_KEY] as FolderItemsMap)
        : {},
      [THEME_KEY]: (typeof result[THEME_KEY] === 'string' ? result[THEME_KEY] : 'midnight') as ThemeId,
      [TOUR_SEEN_KEY]: Boolean(result[TOUR_SEEN_KEY]),
      [NOTES_KEY]: Array.isArray(result[NOTES_KEY]) ? result[NOTES_KEY] : [],
    },
  };
  return payload;
}

export async function importAll(payload: SyncPayload): Promise<void> {
  if (!payload || typeof payload !== 'object') return;
  if (payload.version !== 1 || !payload.data) return;
  const { data } = payload;
  await chrome.storage.local.set({
    [VISITS_KEY]: Array.isArray(data[VISITS_KEY]) ? data[VISITS_KEY] : [],
    [MAX_ITEMS_KEY]: typeof data[MAX_ITEMS_KEY] === 'number' ? data[MAX_ITEMS_KEY] : 50,
    [FOLDERS_KEY]: Array.isArray(data[FOLDERS_KEY]) ? data[FOLDERS_KEY] : [],
    [BOOKMARK_ITEMS_KEY]: typeof data[BOOKMARK_ITEMS_KEY] === 'object' && data[BOOKMARK_ITEMS_KEY]
      ? (data[BOOKMARK_ITEMS_KEY] as FolderItemsMap)
      : {},
    [THEME_KEY]: (typeof data[THEME_KEY] === 'string' ? data[THEME_KEY] : 'midnight') as ThemeId,
    [TOUR_SEEN_KEY]: Boolean(data[TOUR_SEEN_KEY]),
  });
}

