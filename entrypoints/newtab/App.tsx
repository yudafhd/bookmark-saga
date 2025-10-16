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
import { EditIcon, FolderClosed, Plus, RefreshCw, StarSolid, TrashIcon, XIcon } from '@/shared/icons';
import SidebarButton from '@/shared/components/SidebarButton';
import HistorySection from './components/HistorySection';
import SavedSection from './components/SavedSection';
import ThemeModal from './components/ThemeModal';
import FolderModal from './components/FolderModal';

type Mode = 'history' | 'saved';

interface PendingSaveVisit {
  url: string;
  title: string;
  faviconUrl: string;
  visitTime: number | null;
}

const DEFAULT_THEME: ThemeId = 'linux';

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

  const headerIconSrc = useMemo(() => {
    if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
      return chrome.runtime.getURL('icons/icon48.png');
    }
    return '/icons/icon48.png';
  }, []);

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

  // Normalize saved items for the SavedSection component shape
  const processedSavedItems = useMemo(
    () =>
      savedItems.map((item) => ({
        ...item,
        host: getHost(item.url),
        savedLabel: item.savedAt ? `Saved ${formatRelativeTime(item.savedAt)}` : null,
        visitLabel: item.visitTime ? `Visited ${formatRelativeTime(item.visitTime)}` : null,
      })),
    [savedItems],
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
        alert('Folder name is already used at this level.');
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
        alert('Another folder already uses that name at this level.');
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
      const suffix = parts.length ? ` (including ${parts.join(' and ')})` : '';
      const confirmed = confirm(
        `Delete folder "${folder.name}"${suffix}? This action cannot be undone.`,
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
      alert('Create or select a folder first.');
      return;
    }
    const existing = folderItems[selectedFolderId] ?? [];
    if (existing.some((item) => item.url === pendingSaveVisit.url)) {
      alert('This item is already saved in the selected folder.');
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
    ? `Save to Folder — ${getHost(pendingSaveVisit.url)}`
    : 'Save to Folder';

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
    mode === 'history' ? 'Latest visit history' : 'Pages you saved';

  return (
    <div className="w-full p-4 md:p-6 space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="flex items-start gap-3">
          <img
            src={headerIconSrc}
            alt="Bookmark Saga logo"
            className="h-12 w-12 rounded-sm shadow-sm"
            loading="lazy"
          />
          <div>
            <h1 className="text-2xl font-bold">Bookmark Saga</h1>
            <p className="opacity-70" id="headerSubtitle">
              {historyHeaderSubtitle}
            </p>
          </div>
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
              Theme · {currentTheme?.name ?? 'Windows 95'}
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
        <>
          <HistorySection
            loading={loading}
            filteredVisits={filteredVisits}
            hasVisits={filteredVisits.length !== 0}
            savedUrlSet={savedUrlSet}
            onSaveClick={(visit) => {
              openFolderModal(visit);
            }}
          />
        </>
      ) : (
        <SavedSection
          sidebarNodes={sidebarNodes}
          isEmpty={folders.length === 0 && totalSavedCount === 0}
          currentFolderName={currentFolder ? currentFolder.name : 'All saved pages'}
          breadcrumb={currentFolder ? buildBreadcrumb(folders, currentSavedFolderId) : 'Combined from all folders'}
          savedItems={processedSavedItems}
          currentSavedFolderId={currentSavedFolderId}
          resolveFolderName={(id) => folders.find((f) => f.id === id)?.name ?? 'Folder'}
          onCreateRootFolder={() => {
            const name = prompt('New folder name:');
            if (name) void handleCreateFolder(name, null);
          }}
          onCreateSubfolder={() => {
            if (!currentSavedFolderId) return;
            const name = prompt('New subfolder name:');
            if (name) void handleCreateFolder(name, currentSavedFolderId);
          }}
          onRenameFolder={() => {
            if (!currentSavedFolderId) return;
            const folder = folders.find((f) => f.id === currentSavedFolderId);
            if (!folder) return;
            const name = prompt('Rename folder:', folder.name);
            if (name) void handleRenameFolder(folder.id, name);
          }}
          onDeleteFolder={() => {
            if (!currentSavedFolderId) return;
            void handleDeleteFolder(currentSavedFolderId);
          }}
          onRemoveSavedItem={(folderId, url) => void handleRemoveSavedItem(folderId, url)}
        />
      )}

      {isThemeModalOpen ? (
        <ThemeModal
          open={isThemeModalOpen}
          currentThemeId={themeId}
          onClose={() => setThemeModalOpen(false)}
          onChangeTheme={(id) => handleThemeChange(id)}
        />
      ) : null}

      {isFolderModalOpen ? (
        <FolderModal
          open={isFolderModalOpen}
          title={themeModalTitle}
          foldersEmpty={folders.length === 0}
          folderTree={folderTree}
          newName={folderModalNewName}
          onChangeNewName={(v: string) => setFolderModalNewName(v)}
          onCreateFolder={(name: string, parentId: string | null = null) => void handleCreateFolder(name, parentId)}
          onClose={closeFolderModal}
          onSave={() => void handleSavePendingVisit()}
        />
      ) : null}
    </div>
  );
};

export default App;
