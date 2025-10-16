import type { Folder, FolderItem, FolderItemsMap } from './types';

export function normalizeHierarchy(folders: Folder[]): Folder[] {
  const validIds = new Set(folders.map((folder) => folder.id));
  return folders.map((folder) => {
    if (!folder.parentId || !validIds.has(folder.parentId) || folder.parentId === folder.id) {
      return { ...folder, parentId: null };
    }
    return folder;
  });
}

export function getFolderChildren(folders: Folder[], parentId: string | null): Folder[] {
  return folders
    .filter((folder) => (folder.parentId ?? null) === (parentId ?? null))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

export function collectDescendantIds(folders: Folder[], rootId: string | null): Set<string> {
  const collected = new Set<string>();
  if (!rootId) return collected;

  const stack = [rootId];
  while (stack.length) {
    const current = stack.pop();
    if (!current || collected.has(current)) continue;
    collected.add(current);
    const children = getFolderChildren(folders, current);
    for (const child of children) {
      stack.push(child.id);
    }
  }
  return collected;
}

export function ensureFolderItemsMap(
  folders: Folder[],
  folderItems: FolderItemsMap,
): FolderItemsMap {
  const next: FolderItemsMap = { ...folderItems };
  for (const folder of folders) {
    if (!Array.isArray(next[folder.id])) {
      next[folder.id] = [];
    }
  }
  return next;
}

export function getAggregateItemCount(
  folders: Folder[],
  folderItems: FolderItemsMap,
  folderId: string | null,
): number {
  if (!folderId) {
    return Object.values(folderItems).reduce(
      (total, list) => total + (Array.isArray(list) ? list.length : 0),
      0,
    );
  }
  const ids = collectDescendantIds(folders, folderId);
  let total = 0;
  for (const id of ids) {
    const list = folderItems[id];
    if (Array.isArray(list)) {
      total += list.length;
    }
  }
  return total;
}

export function getItemsForFolder(
  folders: Folder[],
  folderItems: FolderItemsMap,
  folderId: string | null,
): (FolderItem & { folderId: string })[] {
  if (!folderId) {
    const aggregated: (FolderItem & { folderId: string })[] = [];
    for (const [id, list] of Object.entries(folderItems)) {
      if (Array.isArray(list)) {
        aggregated.push(...list.map((item) => ({ ...item, folderId: id })));
      }
    }
    return aggregated.sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0));
  }
  const ids = Array.from(collectDescendantIds(folders, folderId));
  const aggregated: (FolderItem & { folderId: string })[] = [];
  for (const id of ids) {
    const list = folderItems[id];
    if (Array.isArray(list)) {
      aggregated.push(...list.map((item) => ({ ...item, folderId: id })));
    }
  }
  return aggregated.sort((a, b) => (b.savedAt ?? 0) - (a.savedAt ?? 0));
}

export function buildBreadcrumb(folders: Folder[], folderId: string | null): string {
  if (!folderId) return '';
  const byId = new Map(folders.map((folder) => [folder.id, folder]));
  const path: string[] = [];
  let current = byId.get(folderId);
  const guard = new Set<string>();
  while (current && !guard.has(current.id)) {
    guard.add(current.id);
    path.unshift(current.name);
    if (!current.parentId) break;
    current = byId.get(current.parentId);
  }
  return path.join(' / ');
}
