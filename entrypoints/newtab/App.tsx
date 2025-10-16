import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  readFolderItems,
  readFolders,
  readTheme,
  readVisits,
  writeFolderItems,
  writeFolders,
  writeTheme,
  writeVisits,
} from '@/lib/storage';
import {
  buildBreadcrumb,
  collectDescendantIds,
  ensureFolderItemsMap,
  getAggregateItemCount,
  getFolderChildren,
  getItemsForFolder,
  normalizeHierarchy,
} from '@/lib/folder-utils';
import { THEMES, getThemeById } from '@/lib/themes';
import type { Folder, FolderItemsMap, ThemeId, VisitEntry } from '@/lib/types';
import { formatRelativeTime, getHost, resolveFavicon } from '@/lib/utils';
import { EditIcon, FolderClosed, Plus, PlusCircle, RefreshCw, Star, StarSolid, TrashIcon, XCircle, XIcon } from '@/shared/icons';

type Mode = 'history' | 'saved';

interface PendingSaveVisit {
  url: string;
  title: string;
  faviconUrl: string;
  visitTime: number | null;
}

const DEFAULT_THEME: ThemeId = 'windows95';

function generateFolderId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `folder_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function openUrl(url: string) {
  try {
    chrome.tabs.update({ url });
  } catch {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}

function isDuplicateName(folders: Folder[], name: string, parentId: string | null, excludeId?: string) {
  return folders.some(
    (folder) =>
      folder.id !== excludeId &&
      (folder.parentId ?? null) === (parentId ?? null) &&
      folder.name.toLowerCase() === name.toLowerCase(),
  );
}

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('history');
  const [visits, setVisits] = useState<VisitEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [folders, setFolders] = useState<Folder[]>([]);
  const [folderItems, setFolderItems] = useState<FolderItemsMap>({});
  const [currentSavedFolderId, setCurrentSavedFolderId] = useState<string | null>(null);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [isThemeModalOpen, setThemeModalOpen] = useState(false);
  const [isFolderModalOpen, setFolderModalOpen] = useState(false);
  const [pendingSaveVisit, setPendingSaveVisit] = useState<PendingSaveVisit | null>(null);
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME);
  const [folderModalNewName, setFolderModalNewName] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [visitData, folderData, folderItemData, storedTheme] = await Promise.all([
          readVisits(),
          readFolders(),
          readFolderItems(),
          readTheme(),
        ]);
        const normalizedFolders = normalizeHierarchy(folderData);
        const ensuredItems = ensureFolderItemsMap(normalizedFolders, folderItemData);
        setVisits(visitData);
        setFolders(normalizedFolders);
        setFolderItems(ensuredItems);
        setThemeId(storedTheme);
        document.body.dataset.theme = storedTheme;
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  useEffect(() => {
    document.body.dataset.theme = themeId;
  }, [themeId]);

  const savedUrlSet = useMemo(() => {
    const urls = new Set<string>();
    for (const list of Object.values(folderItems)) {
      if (!Array.isArray(list)) continue;
      for (const entry of list) {
        urls.add(entry.url);
      }
    }
    return urls;
  }, [folderItems]);

  const filteredVisits = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return visits;
    return visits.filter((item) => {
      const title = item.title?.toLowerCase() ?? '';
      const url = item.url.toLowerCase();
      const host = getHost(item.url).toLowerCase();
      return title.includes(query) || url.includes(query) || host.includes(query);
    });
  }, [visits, searchQuery]);

  const savedItems = useMemo(
    () => getItemsForFolder(folders, folderItems, currentSavedFolderId),
    [folders, folderItems, currentSavedFolderId],
  );

  const totalSavedCount = useMemo(
    () => getAggregateItemCount(folders, folderItems, null),
    [folders, folderItems],
  );

  const currentFolder = useMemo(
    () => folders.find((folder) => folder.id === currentSavedFolderId) ?? null,
    [folders, currentSavedFolderId],
  );

  const openFolderModal = useCallback(
    (visit: VisitEntry) => {
      const existingEntry = Object.entries(folderItems).find(([, list]) =>
        list?.some((item) => item.url === visit.url),
      );
      const containingFolderId = existingEntry?.[0] ?? null;
      setPendingSaveVisit({
        url: visit.url,
        title: visit.title,
        faviconUrl: visit.faviconUrl,
        visitTime: visit.visitTime ?? null,
      });
      if (containingFolderId) {
        setSelectedFolderId(containingFolderId);
      } else if (folders.length > 0) {
        setSelectedFolderId(folders[0].id);
      } else {
        setSelectedFolderId(null);
      }
      setFolderModalOpen(true);
      setFolderModalNewName('');
    },
    [folderItems, folders],
  );

  const closeFolderModal = useCallback(() => {
    setFolderModalOpen(false);
    setPendingSaveVisit(null);
    setFolderModalNewName('');
  }, []);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isThemeModalOpen) {
          setThemeModalOpen(false);
        }
        if (isFolderModalOpen) {
          closeFolderModal();
        }
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [isThemeModalOpen, isFolderModalOpen, closeFolderModal]);

  const refreshVisits = useCallback(async () => {
    const visitData = await readVisits();
    setVisits(visitData);
  }, []);

  const clearVisits = useCallback(async () => {
    await writeVisits([]);
    setVisits([]);
  }, []);

  const persistFolders = useCallback(
    async (nextFolders: Folder[], nextItems: FolderItemsMap) => {
      await Promise.all([writeFolders(nextFolders), writeFolderItems(nextItems)]);
    },
    [],
  );

  const handleCreateFolder = useCallback(
    async (name: string, parentId: string | null = null) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      if (isDuplicateName(folders, trimmed, parentId)) {
        alert('Nama folder sudah digunakan pada level tersebut.');
        return;
      }
      const folder: Folder = {
        id: generateFolderId(),
        name: trimmed,
        parentId,
      };
      const nextFolders = normalizeHierarchy([...folders, folder]);
      const nextItems = ensureFolderItemsMap(nextFolders, folderItems);
      setFolders(nextFolders);
      setFolderItems(nextItems);
      setSelectedFolderId(folder.id);
      setCurrentSavedFolderId(folder.id);
      await persistFolders(nextFolders, nextItems);
    },
    [folders, folderItems, persistFolders],
  );

  const handleRenameFolder = useCallback(
    async (folderId: string, newName: string) => {
      const folder = folders.find((item) => item.id === folderId);
      if (!folder) return;
      const trimmed = newName.trim();
      if (!trimmed || trimmed === folder.name) return;
      if (isDuplicateName(folders, trimmed, folder.parentId, folder.id)) {
        alert('Nama folder lain sudah digunakan pada level yang sama.');
        return;
      }
      const nextFolders = folders.map((item) =>
        item.id === folderId ? { ...item, name: trimmed } : item,
      );
      setFolders(nextFolders);
      await writeFolders(nextFolders);
    },
    [folders],
  );

  const handleDeleteFolder = useCallback(
    async (folderId: string) => {
      const folder = folders.find((item) => item.id === folderId);
      if (!folder) return;
      const descendants = Array.from(collectDescendantIds(folders, folderId));
      const subfolderCount = Math.max(0, descendants.length - 1);
      const itemCount = descendants.reduce(
        (total, id) => total + (folderItems[id]?.length ?? 0),
        0,
      );
      const parts: string[] = [];
      if (subfolderCount > 0) parts.push(`${subfolderCount} subfolder`);
      if (itemCount > 0) parts.push(`${itemCount} item`);
      const suffix = parts.length ? ` (termasuk ${parts.join(' dan ')})` : '';
      const confirmed = confirm(
        `Hapus folder "${folder.name}"${suffix}? Tindakan ini tidak dapat dibatalkan.`,
      );
      if (!confirmed) return;

      const nextFolders = normalizeHierarchy(
        folders.filter((item) => !descendants.includes(item.id)),
      );
      const nextItems = { ...folderItems };
      let mutated = false;
      for (const id of descendants) {
        if (nextItems[id]) {
          delete nextItems[id];
          mutated = true;
        }
      }
      if (descendants.includes(currentSavedFolderId ?? '')) {
        setCurrentSavedFolderId(null);
      }
      if (descendants.includes(selectedFolderId ?? '')) {
        setSelectedFolderId(null);
      }
      const sanitizedItems = mutated
        ? nextItems
        : ensureFolderItemsMap(nextFolders, nextItems);
      setFolders(nextFolders);
      setFolderItems(sanitizedItems);
      await persistFolders(nextFolders, sanitizedItems);
    },
    [folders, folderItems, currentSavedFolderId, selectedFolderId, persistFolders],
  );

  const handleRemoveSavedItem = useCallback(
    async (folderId: string, url: string) => {
      const list = folderItems[folderId];
      if (!Array.isArray(list)) return;
      const updated = list.filter((item) => item.url !== url);
      if (updated.length === list.length) return;
      const nextItems = { ...folderItems, [folderId]: updated };
      setFolderItems(nextItems);
      await writeFolderItems(nextItems);
    },
    [folderItems],
  );

  const handleSavePendingVisit = useCallback(async () => {
    if (!pendingSaveVisit) {
      closeFolderModal();
      return;
    }
    if (!selectedFolderId) {
      alert('Buat atau pilih folder terlebih dahulu.');
      return;
    }
    const existing = folderItems[selectedFolderId] ?? [];
    if (existing.some((item) => item.url === pendingSaveVisit.url)) {
      alert('Item ini sudah tersimpan di folder yang dipilih.');
      return;
    }
    const entry = {
      url: pendingSaveVisit.url,
      title: pendingSaveVisit.title,
      faviconUrl: resolveFavicon(pendingSaveVisit.url, pendingSaveVisit.faviconUrl),
      savedAt: Date.now(),
      visitTime: pendingSaveVisit.visitTime,
    };
    const nextItems = {
      ...folderItems,
      [selectedFolderId]: [entry, ...existing],
    };
    setFolderItems(nextItems);
    setCurrentSavedFolderId(selectedFolderId);
    await writeFolderItems(nextItems);
    closeFolderModal();
  }, [folderItems, selectedFolderId, pendingSaveVisit, closeFolderModal]);

  const handleThemeChange = useCallback(
    async (id: ThemeId) => {
      setThemeId(id);
      await writeTheme(id);
      setThemeModalOpen(false);
    },
    [],
  );

  const currentTheme = useMemo(
    () => getThemeById(themeId) ?? getThemeById(DEFAULT_THEME),
    [themeId],
  );

  const themeModalTitle = pendingSaveVisit
    ? `Simpan ke Folder — ${getHost(pendingSaveVisit.url)}`
    : 'Simpan ke Folder';

  const folderTree = useMemo(() => {
    const build = (parentId: string | null, depth = 0): React.ReactElement[] => {
      return getFolderChildren(folders, parentId).flatMap((folder) => {
        const nodes: React.ReactElement[] = [
          <label
            key={folder.id}
            className="folder-option flex items-center gap-2 rounded-sm px-3 py-2 transition-colors"
            style={{ paddingLeft: `${depth * 16 + 12}px` }}
          >
            <input
              type="radio"
              name="folder"
              value={folder.id}
              checked={selectedFolderId === folder.id}
              onChange={() => setSelectedFolderId(folder.id)}
              className="h-4 w-4"
            />
            <span className="truncate text-sm">{folder.name}</span>
          </label>,
        ];
        nodes.push(...build(folder.id, depth + 1));
        return nodes;
      });
    };
    return build(null);
  }, [folders, selectedFolderId]);

  const sidebarNodes = useMemo(() => {
    const nodes: React.ReactElement[] = [
      <SidebarButton
        key="all"
        label="All items"
        depth={0}
        count={totalSavedCount}
        active={!currentSavedFolderId}
        onClick={() => setCurrentSavedFolderId(null)}
      />,
    ];
    const build = (parentId: string | null, depth = 1) => {
      for (const folder of getFolderChildren(folders, parentId)) {
        nodes.push(
          <SidebarButton
            key={folder.id}
            label={folder.name}
            depth={depth}
            count={getAggregateItemCount(folders, folderItems, folder.id)}
            active={currentSavedFolderId === folder.id}
            onClick={() => setCurrentSavedFolderId(folder.id)}
          />,
        );
        build(folder.id, depth + 1);
      }
    };
    build(null);
    return nodes;
  }, [folders, folderItems, totalSavedCount, currentSavedFolderId]);

  const historyHeaderSubtitle =
    mode === 'history' ? 'Riwayat kunjungan terbaru' : 'Halaman yang kamu simpan';

  return (
    <div className="w-full p-4 md:p-6 space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookmark Saga</h1>
          <p className="opacity-70" id="headerSubtitle">
            {historyHeaderSubtitle}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex gap-2">
            <button
              type="button"
              className={`mode-toggle px-3 py-1 text-xs font-medium rounded-sm transition ${mode === 'history' ? 'mode-toggle--active' : ''
                }`}
              onClick={() => setMode('history')}
              aria-pressed={mode === 'history'}
            >
              History
            </button>
            <button
              type="button"
              className={`mode-toggle px-3 py-1 text-xs font-medium rounded-sm transition ${mode === 'saved' ? 'mode-toggle--active' : ''
                }`}
              onClick={() => setMode('saved')}
              aria-pressed={mode === 'saved'}
            >
              Saved
            </button>
          </div>
          <input
            id="search"
            type="search"
            placeholder="Search by title or URL..."
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full sm:w-60 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white/90 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          />
          <div className="flex gap-2">
            <button
              type="button"
              className="bs-btn bs-btn--accent px-4 py-2 rounded-sm font-medium"
              onClick={() => setThemeModalOpen(true)}
              aria-expanded={isThemeModalOpen}
            >
              Tema · {currentTheme?.name ?? 'Windows 95'}
            </button>
            <button
              type="button"
              className="bs-btn bs-btn--primary px-4 py-2"
              onClick={refreshVisits}
            >
              <RefreshCw className='w-4' />
              Refresh
            </button>
            {visits.length > 0 && (
              <button
                type="button"
                className="bs-btn bs-btn--danger px-4 py-2"
                onClick={clearVisits}
              >
                <TrashIcon className='w-4' />
                Clear History
              </button>
            )}
          </div>
        </div>
      </header>

      {mode === 'history' ? (
        <section className="space-y-6">
          {loading ? (
            <p className="text-sm opacity-70">Loading visits…</p>
          ) : filteredVisits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg opacity-90">No visits recorded yet.</p>
              <p className="mt-2 text-sm opacity-70">
                Visit some websites and come back here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="grid">
              {filteredVisits.map((visit) => (
                <article key={visit.url} className="bs-card transition p-3">
                  <div className="space-y-4">
                    <div className='flex items-center gap-2'>
                      <img
                        src={visit.faviconUrl}
                        alt=""
                        className="w-8 h-8 rounded"
                        loading="lazy"
                      />
                      <a
                        href={visit.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lg font-medium hover:underline line-clamp-2"
                      >
                        {visit.title}
                      </a>
                    </div>
                    <div className='flex gap-3'>
                      <p className="text-xs opacity-70 truncate">
                        {getHost(visit.url)}
                      </p>
                      <span className="inline-block text-xs opacity-75">
                        viewed {formatRelativeTime(visit.visitTime)}
                      </span>
                      <button
                        type="button"
                        className={`bs-btn ${savedUrlSet.has(visit.url) ? 'bs-btn--success' : 'bs-btn--primary'} px-2 py-1 text-xs font-medium`}
                        onClick={(event) => {
                          event.preventDefault();
                          openFolderModal(visit);
                        }}
                      >
                        {savedUrlSet.has(visit.url) ? <StarSolid className='w-3' /> : 'Save'}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-6" id="savedView">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <aside className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold uppercase tracking-wide">Folders</h2>
                <button
                  type="button"
                  className="bs-btn bs-btn--neutral text-xs px-2 py-1"
                  onClick={() => {
                    const name = prompt('Nama folder baru:');
                    if (name) {
                      void handleCreateFolder(name, null);
                    }
                  }}
                >
                  <Plus className='w-4' />
                </button>
              </div>
              <nav className="space-y-1 text-sm">{sidebarNodes}</nav>
            </aside>
            <div className="col-span-4 space-y-4">
              {folders.length === 0 && totalSavedCount === 0 ? (
                <div className="text-center py-12">
                  <p className="text-lg opacity-90">No saved items yet.</p>
                  <p className="mt-2 text-sm opacity-70">
                    Save pages from the history list to see them here.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                      <div className='flex gap-2'>
                        <FolderClosed className='w-4' />
                        <h2 className="text-xl font-semibold">
                          {currentFolder ? currentFolder.name : 'All saved pages'}
                        </h2>
                      </div>
                      <p className="text-sm opacity-70">
                        {currentFolder
                          ? buildBreadcrumb(folders, currentSavedFolderId)
                          : 'Combined from all folders'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className="bs-btn bs-btn--success px-3 py-1 text-sm"
                        onClick={() => {
                          if (!currentSavedFolderId) return;
                          const name = prompt('Nama subfolder baru:');
                          if (name) {
                            void handleCreateFolder(name, currentSavedFolderId);
                          }
                        }}
                        disabled={!currentSavedFolderId}
                      >
                        <Plus className='w-4' />
                      </button>
                      <button
                        type="button"
                        className="bs-btn bs-btn--neutral px-3 py-1 text-sm"
                        onClick={() => {
                          if (!currentSavedFolderId) return;
                          const folder = folders.find((f) => f.id === currentSavedFolderId);
                          if (!folder) return;
                          const name = prompt('Nama folder baru:', folder.name);
                          if (name) {
                            void handleRenameFolder(folder.id, name);
                          }
                        }}
                        disabled={!currentSavedFolderId}
                      >
                        <EditIcon className='w-4' />
                      </button>
                      <button
                        type="button"
                        className="bs-btn bs-btn--danger px-3 py-1 text-sm"
                        onClick={() => {
                          if (!currentSavedFolderId) return;
                          void handleDeleteFolder(currentSavedFolderId);
                        }}
                        disabled={!currentSavedFolderId}
                      >
                        <TrashIcon className='w-4' />
                      </button>
                    </div>
                  </div>
                  <div className="bs-surface max-w-[80vw] rounded-sm border border-transparent shadow-sm">
                    {savedItems.length === 0 ? (
                      <p className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                        {currentSavedFolderId
                          ? 'No items in this folder yet.'
                          : 'No items saved yet.'}
                      </p>
                    ) : (
                      savedItems.map((item) => (
                        <div
                          key={`${item.folderId}-${item.url}`}
                          className="bs-surface-item px-4 py-3 flex items-start gap-3 transition"
                        >
                          <img
                            src={item.faviconUrl}
                            alt=""
                            className="w-6 h-6 rounded mt-1"
                            loading="lazy"
                          />
                          <div className="flex-1 min-w-0">
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm truncate font-medium text-blue-600 dark:text-blue-400 hover:underline line-clamp-2"
                            >
                              {item.title}
                            </a>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs opacity-70">
                              <span>{getHost(item.url)}</span>
                              {item.savedAt ? (
                                <span>Saved {formatRelativeTime(item.savedAt)}</span>
                              ) : null}
                              {item.visitTime ? (
                                <span>Visited {formatRelativeTime(item.visitTime)}</span>
                              ) : null}
                              {!currentSavedFolderId && (
                                <span className="px-2 py-0.5 rounded-sm bg-gray-200/70 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300">
                                  {folders.find((folder) => folder.id === item.folderId)?.name ??
                                    'Folder'}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="shrink-0">
                            <button
                              type="button"
                              className="bs-btn bs-btn--danger text-xs font-semibold px-2 py-1"
                              onClick={(event) => {
                                event.preventDefault();
                                void handleRemoveSavedItem(item.folderId, item.url);
                              }}
                            >
                              <StarSolid className='w-4' />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {isThemeModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setThemeModalOpen(false);
            }
          }}
        >
          <div className="max-h-[80vh] overflow-y-auto bs-surface max-w-md w-full p-6 rounded-2xl border border-white/40 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">Choose Theme</h2>
                <p className="text-sm opacity-70">
                  Customize Bookmark Saga’s look to your preferred style.
                </p>
              </div>
              <button
                type="button"
                className="bs-btn bs-btn--ghost text-sm px-3 py-1.5"
                onClick={() => setThemeModalOpen(false)}
              >
                <XIcon className='w-4' />
              </button>
            </div>
            <div className="space-y-3">
              {THEMES.map((theme) => {
                const active = theme.id === themeId;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    className={`theme-option${active ? ' theme-option--active' : ''}`}
                    onClick={() => handleThemeChange(theme.id)}
                    aria-pressed={active}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="text-left">
                        <p className="theme-option-title">{theme.name}</p>
                        <p className="theme-option-desc">{theme.description}</p>
                      </div>
                      <span className={`theme-option-chip theme-option-chip--${theme.id}`} />
                    </div>
                  </button>
                );
              })}
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs opacity-60">Theme changes apply immediately.</p>
              <button
                type="button"
                className="bs-btn bs-btn--neutral px-3 py-1.5 text-sm font-medium"
                onClick={() => handleThemeChange(DEFAULT_THEME)}
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}

      {isFolderModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              closeFolderModal();
            }
          }}
        >
          <div className="bs-surface max-w-md w-full p-6 rounded-2xl border border-white/30 space-y-7">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold">{themeModalTitle}</h2>
                <p className="text-sm opacity-70">
                  Pilih folder tujuan atau buat yang baru.
                </p>
              </div>
              <button
                type="button"
                className="bs-btn bs-btn--neutral text-sm px-3 py-1.5"
                onClick={closeFolderModal}
              >
                <XIcon className='w-4' />
              </button>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1">
              {folders.length === 0 ? (
                <p className="text-sm text-gray-500">No folders yet.</p>
              ) : (
                folderTree
              )}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={folderModalNewName}
                onChange={(event) => setFolderModalNewName(event.target.value)}
                placeholder="New folder name"
                className="flex-1 px-3 py-2 rounded border border-transparent bg-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
              />
              <button
                type="button"
                className="bs-btn bs-btn--success px-4 py-2"
                onClick={() => {
                  if (!folderModalNewName.trim()) return;
                  void handleCreateFolder(folderModalNewName, selectedFolderId);
                  setFolderModalNewName('');
                }}
              >
                <Plus className='w-4' />
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="bs-btn bs-btn--danger px-4 py-2 text-sm font-medium"
                onClick={closeFolderModal}
              >
                Cancel
              </button>
              <button
                type="button"
                className="bs-btn bs-btn--primary px-4 py-2"
                onClick={() => void handleSavePendingVisit()}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface SidebarButtonProps {
  label: string;
  depth: number;
  count: number;
  active: boolean;
  onClick: () => void;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ label, depth, count, active, onClick }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'w-full flex items-center justify-between gap-2 px-3 py-2 transition',
        active
          ? 'font-bold'
          : '',
      ].join(' ')}
      style={{ paddingLeft: `${Math.max(0, depth - 1) * 16 + 12}px` }}
      aria-current={active ? 'page' : undefined}
    >
      <div className='flex gap-2'>
        <FolderClosed className='w-4' />
        <span className="truncate">{label}</span>
      </div>
      <span className="text-xs">
        {count}
      </span>
    </button>
  );
};

export default App;
