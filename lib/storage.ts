import {
  BOOKMARK_ITEMS_KEY,
  DEFAULT_MAX_HISTORY_ITEMS,
  FOLDERS_KEY,
  MAX_ITEMS_KEY,
  THEME_KEY,
  VISITS_KEY,
} from './constants';
import { clampMaxItems, externalFaviconUrl, isSafeFavicon } from './utils';
import type { Folder, FolderItem, FolderItemsMap, ThemeId, VisitEntry } from './types';

export async function readVisits(): Promise<VisitEntry[]> {
  const result = await chrome.storage.local.get({
    [VISITS_KEY]: [] as VisitEntry[],
  });
  const raw = result[VISITS_KEY];
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .filter(
      (item): item is VisitEntry =>
        !!item &&
        typeof item.url === 'string' &&
        typeof item.title === 'string' &&
        typeof item.visitTime === 'number' &&
        typeof item.faviconUrl === 'string',
    )
    .map((item) => ({
      url: item.url,
      title: item.title || item.url,
      visitTime: item.visitTime || Date.now(),
      faviconUrl: item.faviconUrl,
    }));
}

export async function writeVisits(visits: VisitEntry[]): Promise<void> {
  await chrome.storage.local.set({
    [VISITS_KEY]: visits,
  });
}

// setting for max history recorded
export async function readMaxItems(): Promise<number> {
  const result = await chrome.storage.local.get({
    [MAX_ITEMS_KEY]: DEFAULT_MAX_HISTORY_ITEMS,
  });
  return clampMaxItems(result[MAX_ITEMS_KEY] ?? DEFAULT_MAX_HISTORY_ITEMS);
}

export async function writeMaxItems(value: number): Promise<void> {
  await chrome.storage.local.set({
    [MAX_ITEMS_KEY]: clampMaxItems(value),
  });
}

export async function readFolders(): Promise<Folder[]> {
  const result = await chrome.storage.local.get({
    [FOLDERS_KEY]: [] as Folder[],
  });
  const raw = result[FOLDERS_KEY];
  if (!Array.isArray(raw)) {
    return [];
  }
  return raw
    .filter(
      (folder): folder is Folder =>
        !!folder &&
        typeof folder.id === 'string' &&
        typeof folder.name === 'string',
    )
    .map((folder) => ({
      id: folder.id,
      name: folder.name,
      parentId:
        typeof folder.parentId === 'string' && folder.parentId.length > 0
          ? folder.parentId
          : null,
    }));
}

export async function writeFolders(folders: Folder[]): Promise<void> {
  await chrome.storage.local.set({
    [FOLDERS_KEY]: folders,
  });
}

export async function readFolderItems(): Promise<FolderItemsMap> {
  const result = await chrome.storage.local.get({
    [BOOKMARK_ITEMS_KEY]: {} as FolderItemsMap,
  });
  const raw = result[BOOKMARK_ITEMS_KEY];
  if (!raw || typeof raw !== 'object') {
    return {};
  }
  const normalized: FolderItemsMap = {};
  for (const [folderId, entries] of Object.entries(raw)) {
    if (!Array.isArray(entries)) continue;
    const cleaned: FolderItem[] = entries
      .filter((item): item is FolderItem => !!item && typeof item.url === 'string')
      .map((item) => ({
        url: item.url,
        title: item.title || item.url,
        faviconUrl: isSafeFavicon(item.faviconUrl)
          ? item.faviconUrl
          : externalFaviconUrl(item.url),
        savedAt: typeof item.savedAt === 'number' ? item.savedAt : Date.now(),
        visitTime:
          typeof item.visitTime === 'number' || item.visitTime === null
            ? item.visitTime
            : null,
      }));
    normalized[folderId] = cleaned;
  }
  return normalized;
}

export async function writeFolderItems(items: FolderItemsMap): Promise<void> {
  await chrome.storage.local.set({
    [BOOKMARK_ITEMS_KEY]: items,
  });
}

export async function readTheme(): Promise<ThemeId> {
  const result = await chrome.storage.local.get({
    [THEME_KEY]: 'linux' satisfies ThemeId,
  });
  const candidate = result[THEME_KEY];
  return (typeof candidate === 'string' ? candidate : 'linux') as ThemeId;
}

export async function writeTheme(theme: ThemeId): Promise<void> {
  await chrome.storage.local.set({
    [THEME_KEY]: theme,
  });
}
