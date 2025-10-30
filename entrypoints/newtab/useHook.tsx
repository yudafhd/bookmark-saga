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
    readTourSeen,
    writeTourSeen,
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
import { getThemeById } from '@/lib/themes';
import type { Folder, FolderItem, FolderItemsMap, ThemeId, VisitEntry } from '@/lib/types';
import { getHostName, resolveFavicon } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/time';
import SidebarButton from '@/shared/components/SidebarButton';

type Mode = 'history' | 'saved';

interface PendingSaveVisit {
    url: string;
    title: string;
    faviconUrl: string;
    visitTime: number | null;
    savedAt?: number;
    sourceFolderId: string | null;
}

const DEFAULT_THEME: ThemeId = 'linux';

function generateFolderId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `folder_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

type TabsApi = {
    create?: (createProperties: { url: string }) => Promise<unknown> | void;
};

function openUrlInNewTab(url: string): void {
    const globalObj = globalThis as typeof globalThis & {
        chrome?: { tabs?: TabsApi };
        browser?: { tabs?: TabsApi };
    };

    const tryCreate = (tabs?: TabsApi) => {
        if (!tabs?.create) return false;
        try {
            void tabs.create({ url });
            return true;
        } catch {
            return false;
        }
    };

    if (tryCreate(globalObj.browser?.tabs)) return;
    if (tryCreate(globalObj.chrome?.tabs)) return;

    try {
        window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
        // ignore failures; there's no actionable fallback
    }
}

function isDuplicateName(
    folders: Folder[],
    name: string,
    parentId: string | null,
    excludeId?: string,
) {
    return folders.some(
        (folder) =>
            folder.id !== excludeId &&
            (folder.parentId ?? null) === (parentId ?? null) &&
            folder.name.toLowerCase() === name.toLowerCase(),
    );
}

export default function useHook() {
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
    const [isGithubModalOpen, setGithubModalOpen] = useState(false);
    const [isContactModalOpen, setContactModalOpen] = useState(false);
    const [isTourOpen, setTourOpen] = useState(false);
    const [pendingSaveVisit, setPendingSaveVisit] = useState<PendingSaveVisit | null>(null);
    const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME);
    const [folderModalNewName, setFolderModalNewName] = useState('');

    // Initial load
    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [folderData, folderItemData, storedTheme, tourSeen] = await Promise.all([
                    readFolders(),
                    readFolderItems(),
                    readTheme(),
                    readTourSeen(),
                ]);

                const visitData = await readVisits();

                const normalizedFolders = normalizeHierarchy(folderData);
                const ensuredItems = ensureFolderItemsMap(normalizedFolders, folderItemData);

                setVisits(visitData);
                setFolders(normalizedFolders);
                setFolderItems(ensuredItems);
                setThemeId(storedTheme);
                document.body.dataset.theme = storedTheme;
                setTourOpen(!tourSeen);
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, []);

    // Sync theme to document
    useEffect(() => {
        document.body.dataset.theme = themeId;
    }, [themeId]);

    // Debug: dump storage once
    useEffect(() => {
        // Safe guard if chrome is unavailable
        try {

            chrome?.storage?.local?.get?.().then((e: unknown) => console.log(e));
        } catch {
            // ignore
        }
    }, []);

    // Derived sets/memos
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
            const host = getHostName(item.url).toLowerCase();
            return title.includes(query) || url.includes(query) || host.includes(query);
        });
    }, [visits, searchQuery]);

    const savedItems = useMemo(
        () => getItemsForFolder(folders, folderItems, currentSavedFolderId),
        [folders, folderItems, currentSavedFolderId],
    );

    const filteredSavedItems = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return savedItems;
        return savedItems.filter((item) => {
            const title = item.title?.toLowerCase() ?? '';
            const url = item.url.toLowerCase();
            const host = getHostName(item.url).toLowerCase();
            return title.includes(query) || url.includes(query) || host.includes(query);
        });
    }, [savedItems, searchQuery]);

    const processedSavedItems = useMemo(
        () =>
            filteredSavedItems.map((item) => ({
                ...item,
                host: getHostName(item.url),
                savedLabel: item.savedAt ? `Saved ${formatRelativeTime(item.savedAt)}` : null,
                visitLabel: item.visitTime ? `Visited ${formatRelativeTime(item.visitTime)}` : null,
            })),
        [filteredSavedItems],
    );

    const totalSavedCount = useMemo(
        () => getAggregateItemCount(folders, folderItems, null),
        [folders, folderItems],
    );

    const currentFolder = useMemo(
        () => folders.find((folder) => folder.id === currentSavedFolderId) ?? null,
        [folders, currentSavedFolderId],
    );

    const openUrls = useCallback((urls: string[]) => {
        const uniqueUrls = Array.from(new Set(urls));
        for (const url of uniqueUrls) {
            openUrlInNewTab(url);
        }
    }, []);

    const openFolderItems = useCallback(
        (folderId: string | null) => {
            const items = getItemsForFolder(folders, folderItems, folderId);
            if (items.length === 0) return;
            openUrls(items.map((item) => item.url));
        },
        [folders, folderItems, openUrls],
    );

    const openCurrentFolderItems = useCallback(
        (items?: Array<{ url: string }>) => {
            if (items && items.length > 0) {
                openUrls(items.map((item) => item.url));
                return;
            }
            openFolderItems(currentSavedFolderId);
        },
        [openUrls, openFolderItems, currentSavedFolderId],
    );

    // Actions
    const openFolderModal = useCallback(
        (visit: VisitEntry) => {
            const existingEntry = Object.entries(folderItems).find(([, list]) =>
                list?.some((item) => item.url === visit.url),
            );
            const containingFolderId = existingEntry?.[0] ?? null;
            const existingItem = existingEntry?.[1]?.find((item) => item.url === visit.url) ?? null;
            setPendingSaveVisit({
                url: visit.url,
                title: visit.title,
                faviconUrl: visit.faviconUrl,
                visitTime: visit.visitTime ?? null,
                savedAt: existingItem?.savedAt,
                sourceFolderId: containingFolderId,
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

    // keyboard event for closing modals
    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                if (isThemeModalOpen) {
                    setThemeModalOpen(false);
                }
                if (isFolderModalOpen) {
                    closeFolderModal();
                }
                if (isGithubModalOpen) {
                    setGithubModalOpen(false);
                }
                if (isContactModalOpen) {
                    setContactModalOpen(false);
                }
            }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isThemeModalOpen, isFolderModalOpen, isGithubModalOpen, isContactModalOpen, closeFolderModal]);

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

    const handleExportFolders = useCallback(() => {
        try {
            const serializedFolders = folders.map((folder) => ({
                id: folder.id,
                name: folder.name,
                parentId: folder.parentId,
            }));
            const serializedItems: FolderItemsMap = {};
            for (const [folderId, items] of Object.entries(folderItems)) {
                serializedItems[folderId] = items.map((item) => ({
                    url: item.url,
                    title: item.title,
                    faviconUrl: item.faviconUrl,
                    savedAt: item.savedAt,
                    visitTime: item.visitTime,
                }));
            }
            const payload = {
                version: 1,
                exportedAt: new Date().toISOString(),
                folders: serializedFolders,
                folderItems: serializedItems,
            };
            const blob = new Blob([JSON.stringify(payload, null, 2)], {
                type: 'application/json',
            });
            const url = URL.createObjectURL(blob);
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `bookmark-saga-export-${new Date().toISOString().slice(0, 10)}.json`;
            document.body.appendChild(anchor);
            anchor.click();
            document.body.removeChild(anchor);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to export bookmark folders', error);
            alert('Failed to export bookmarks. Check the console for details.');
        }
    }, [folders, folderItems]);

    const handleImportFolders = useCallback(
        async (file: File) => {
            try {
                const text = await file.text();
                const parsed = JSON.parse(text);
                const rawFolders: unknown = parsed?.folders ?? [];
                const rawItems: unknown = parsed?.folderItems ?? {};

                const sanitizedFolders = Array.isArray(rawFolders)
                    ? rawFolders
                        .map((folder): Folder | null => {
                            if (
                                !folder ||
                                typeof folder !== 'object' ||
                                typeof (folder as { id?: unknown }).id !== 'string'
                            ) {
                                return null;
                            }
                            const id = (folder as { id: string }).id;
                            const nameCandidate = (folder as { name?: unknown }).name;
                            const parentCandidate = (folder as { parentId?: unknown }).parentId;
                            const name =
                                typeof nameCandidate === 'string' && nameCandidate.trim().length > 0
                                    ? nameCandidate.trim()
                                    : 'Untitled folder';
                            const parentId =
                                typeof parentCandidate === 'string' && parentCandidate.length > 0
                                    ? parentCandidate
                                    : null;
                            return { id, name, parentId };
                        })
                        .filter((folder): folder is Folder => folder !== null)
                    : [];

                const sanitizedItems: FolderItemsMap = {};
                for (const folder of sanitizedFolders) {
                    sanitizedItems[folder.id] = [];
                }

                if (rawItems && typeof rawItems === 'object') {
                    for (const [folderId, entries] of Object.entries(rawItems as Record<string, unknown>)) {
                        if (!sanitizedItems[folderId] || !Array.isArray(entries)) continue;
                        const cleaned = entries
                            .map((entry): FolderItem | null => {
                                if (!entry || typeof entry !== 'object') return null;
                                const item = entry as Partial<FolderItem> & { url?: unknown };
                                if (typeof item.url !== 'string') return null;
                                const title =
                                    typeof item.title === 'string' && item.title.trim().length > 0
                                        ? item.title.trim()
                                        : item.url;
                                const savedAt =
                                    typeof item.savedAt === 'number' && Number.isFinite(item.savedAt)
                                        ? item.savedAt
                                        : Date.now();
                                const visitTime =
                                    typeof item.visitTime === 'number' && Number.isFinite(item.visitTime)
                                        ? item.visitTime
                                        : null;
                                const faviconCandidate =
                                    typeof item.faviconUrl === 'string' ? item.faviconUrl : undefined;
                                return {
                                    url: item.url,
                                    title,
                                    faviconUrl: resolveFavicon(item.url, faviconCandidate),
                                    savedAt,
                                    visitTime,
                                };
                            })
                            .filter((entry): entry is FolderItem => entry !== null);
                        sanitizedItems[folderId] = cleaned;
                    }
                }

                const normalizedFolders = normalizeHierarchy(sanitizedFolders);
                const ensuredItems = ensureFolderItemsMap(normalizedFolders, sanitizedItems);
                setFolders(normalizedFolders);
                setFolderItems(ensuredItems);
                setCurrentSavedFolderId(null);
                setSelectedFolderId(null);
                await persistFolders(normalizedFolders, ensuredItems);
                alert('Bookmarks imported successfully!');
            } catch (error) {
                console.error('Failed to import bookmark folders', error);
                alert('Failed to import bookmarks. Make sure the file is a valid Bookmark Saga export.');
            }
        },
        [persistFolders],
    );

    const handleImportFromChrome = useCallback(async () => {

        if (typeof chrome === 'undefined' || !chrome.bookmarks?.getTree) {
            alert('Chrome bookmarks API is not available in this context.');
            return;
        }
        try {
            const nodes = await new Promise<chrome.bookmarks.BookmarkTreeNode[]>((resolve, reject) => {

                chrome.bookmarks.getTree((result) => {

                    const error = chrome.runtime.lastError;
                    if (error) {
                        reject(new Error(error.message));
                        return;
                    }
                    resolve(result);
                });
            });

            if (!nodes || nodes.length === 0) {
                alert('No Chrome bookmarks found to import.');
                return;
            }

            const nextFolders = [...folders];
            const nextItems: FolderItemsMap = { ...folderItems };

            const makeUniqueName = (rawName: string, parentId: string | null): string => {
                const baseName = rawName.trim().length > 0 ? rawName.trim() : 'Untitled folder';
                let candidate = baseName;
                let suffix = 2;
                while (isDuplicateName(nextFolders, candidate, parentId)) {
                    candidate = `${baseName} (${suffix})`;
                    suffix += 1;
                }
                return candidate;
            };

            const createFolder = (name: string, parentId: string | null): Folder => {
                const folder: Folder = {
                    id: generateFolderId(),
                    name: makeUniqueName(name, parentId),
                    parentId,
                };
                nextFolders.push(folder);
                nextItems[folder.id] = [];
                return folder;
            };

            const now = new Date();
            const importRoot = createFolder(`Chrome import ${now.toLocaleDateString()}`, null);

            const addItemToFolder = (folderId: string, url: string, title: string) => {
                const entry: FolderItem = {
                    url,
                    title: title.trim().length > 0 ? title.trim() : url,
                    faviconUrl: resolveFavicon(url, undefined),
                    savedAt: Date.now(),
                    visitTime: null,
                };
                const existing = nextItems[folderId] ?? [];
                nextItems[folderId] = [entry, ...existing];
            };

            // eslint-disable-next-line @typescript-eslint/no-shadow
            const processNode = (node: chrome.bookmarks.BookmarkTreeNode, parentFolderId: string) => {
                if (!node) return;
                if (typeof node.url === 'string' && node.url.length > 0) {
                    addItemToFolder(parentFolderId, node.url, node.title ?? node.url);
                    return;
                }
                const childFolder = createFolder(node.title ?? 'Untitled folder', parentFolderId);
                if (Array.isArray(node.children)) {
                    for (const child of node.children) {
                        processNode(child, childFolder.id);
                    }
                }
            };

            const roots = nodes[0]?.children ?? nodes;
            for (const node of roots) {
                processNode(node, importRoot.id);
            }

            const normalizedFolders = normalizeHierarchy(nextFolders);
            const ensuredItems = ensureFolderItemsMap(normalizedFolders, nextItems);
            setFolders(normalizedFolders);
            setFolderItems(ensuredItems);
            setCurrentSavedFolderId(importRoot.id);
            setSelectedFolderId(importRoot.id);
            await persistFolders(normalizedFolders, ensuredItems);
            alert('Chrome bookmarks imported successfully!');
        } catch (error) {
            console.error('Failed to import Chrome bookmarks', error);
            alert('Failed to import Google Chrome bookmarks. Check the console for details.');
        }
    }, [folders, folderItems, persistFolders]);

    const handleManageSavedItem = useCallback((folderId: string, item: FolderItem) => {
        setPendingSaveVisit({
            url: item.url,
            title: item.title,
            faviconUrl: item.faviconUrl,
            visitTime: item.visitTime,
            savedAt: item.savedAt,
            sourceFolderId: folderId,
        });
        setSelectedFolderId(folderId);
        setCurrentSavedFolderId(folderId);
        setFolderModalOpen(true);
        setFolderModalNewName('');
    }, []);

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
            const nextFolders = folders.map((item) => (item.id === folderId ? { ...item, name: trimmed } : item));
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
            const itemCount = descendants.reduce((total, id) => total + (folderItems[id]?.length ?? 0), 0);
            const parts: string[] = [];
            if (subfolderCount > 0) parts.push(`${subfolderCount} subfolder`);
            if (itemCount > 0) parts.push(`${itemCount} item`);
            const suffix = parts.length ? ` (including ${parts.join(' and ')})` : '';
            const confirmed = confirm(`Delete folder "${folder.name}"${suffix}? This action cannot be undone.`);
            if (!confirmed) return;

            const nextFolders = normalizeHierarchy(folders.filter((item) => !descendants.includes(item.id)));
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
            const sanitizedItems = mutated ? nextItems : ensureFolderItemsMap(nextFolders, nextItems);
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

    const handleRenameSavedItem = useCallback(
        (folderId: string, oldUrl: string) => {
            const list = folderItems[folderId];
            if (!Array.isArray(list)) return;

            const next = prompt('Update URL:', oldUrl);
            if (next === null) return; // cancelled
            const newUrl = next.trim();
            if (!newUrl || newUrl === oldUrl) return;

            try {
                // Validate absolute URL
                // eslint-disable-next-line no-new

                new URL(newUrl);
            } catch {
                alert('Invalid URL. Please enter a full URL like https://example.com/page');
                return;
            }

            if (list.some((i) => i.url === newUrl)) {
                alert('This URL already exists in the current folder.');
                return;
            }

            const updatedList = list.map((i) =>
                i.url === oldUrl ? { ...i, url: newUrl, faviconUrl: resolveFavicon(newUrl, i.faviconUrl) } : i,
            );
            const nextItems = { ...folderItems, [folderId]: updatedList };
            setFolderItems(nextItems);
            void writeFolderItems(nextItems);
        },
        [folderItems],
    );

    const handleRenameSavedTitle = useCallback(
        (folderId: string, url: string, currentTitle: string) => {
            const list = folderItems[folderId];
            if (!Array.isArray(list)) return;

            const next = prompt('Update title:', currentTitle);
            if (next === null) return; // cancelled
            const newTitle = next.trim();
            if (!newTitle) {
                alert('Title cannot be empty.');
                return;
            }

            const updatedList = list.map((i) => (i.url === url ? { ...i, title: newTitle } : i));
            const nextItems = { ...folderItems, [folderId]: updatedList };
            setFolderItems(nextItems);
            void writeFolderItems(nextItems);
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
        const sourceFolderId = pendingSaveVisit.sourceFolderId ?? null;
        if (sourceFolderId && sourceFolderId === selectedFolderId) {
            alert('This item is already saved in the selected folder.');
            return;
        }
        const targetExisting = folderItems[selectedFolderId] ?? [];
        if (targetExisting.some((item) => item.url === pendingSaveVisit.url)) {
            alert('This item is already saved in the selected folder.');
            return;
        }

        const nextItems: FolderItemsMap = { ...folderItems };
        if (sourceFolderId && nextItems[sourceFolderId]) {
            nextItems[sourceFolderId] = nextItems[sourceFolderId].filter((item) => item.url !== pendingSaveVisit.url);
        }

        const entry = {
            url: pendingSaveVisit.url,
            title: pendingSaveVisit.title,
            faviconUrl: resolveFavicon(pendingSaveVisit.url, pendingSaveVisit.faviconUrl),
            savedAt: pendingSaveVisit.savedAt ?? Date.now(),
            visitTime: pendingSaveVisit.visitTime,
        };
        const targetList = nextItems[selectedFolderId] ?? [];
        nextItems[selectedFolderId] = [entry, ...targetList];

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

    const currentTheme = useMemo(() => getThemeById(themeId) ?? getThemeById(DEFAULT_THEME), [themeId]);

    const folderModalTitle = pendingSaveVisit
        ? `${pendingSaveVisit.sourceFolderId ? 'Move bookmark' : 'Save to Folder'} — ${getHostName(pendingSaveVisit.url)}`
        : 'Save to Folder';

    const folderTree = useMemo(() => {
        const build = (parentId: string | null, depth = 0): React.ReactElement[] => {
            return getFolderChildren(folders, parentId).flatMap((folder) => {
                const nodes: React.ReactElement[] = [
                    (
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
                        </label>
                    ),
                ];
                nodes.push(...build(folder.id, depth + 1));
                return nodes;
            });
        };
        return build(null);
    }, [folders, selectedFolderId]);

    const sidebarNodes = useMemo(() => {
        const nodes: React.ReactElement[] = [
            (
                <SidebarButton
                    key="all"
                    label="All items"
                    depth={0}
                    count={totalSavedCount}
                    active={!currentSavedFolderId}
                    onClick={() => setCurrentSavedFolderId(null)}
                    onOpenAll={() => openFolderItems(null)}
                />
            ),
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
                        onOpenAll={() => openFolderItems(folder.id)}
                    />,
                );
                build(folder.id, depth + 1);
            }
        };
        build(null);
        return nodes;
    }, [folders, folderItems, totalSavedCount, currentSavedFolderId, openFolderItems]);

    const historyHeaderSubtitle = useMemo(() => {
        if (mode === 'history') {
            const trimmed = searchQuery.trim();
            return trimmed ? `Showing visits matching "${trimmed}"` : 'Latest visit history';
        }
        if (currentFolder) {
            return `Viewing "${currentFolder.name}" saved pages`;
        }
        return 'Pages you saved';
    }, [mode, searchQuery, currentFolder]);

    // Convenience helpers for App wiring
    const openThemeModal = useCallback(() => setThemeModalOpen(true), []);
    const closeThemeModal = useCallback(() => setThemeModalOpen(false), []);
    const openGithubModal = useCallback(() => setGithubModalOpen(true), []);
    const closeGithubModal = useCallback(() => setGithubModalOpen(false), []);
    const openContactModal = useCallback(() => setContactModalOpen(true), []);
    const closeContactModal = useCallback(() => setContactModalOpen(false), []);

    const closeTour = useCallback(async () => {
        await writeTourSeen(true);
        setTourOpen(false);
    }, []);

    const createRootFolder = useCallback(() => {
        const name = prompt('New folder name:');
        if (name) void handleCreateFolder(name, null);
    }, [handleCreateFolder]);

    const createSubfolder = useCallback(() => {
        if (!currentSavedFolderId) return;
        const name = prompt('New subfolder name:');
        if (name) void handleCreateFolder(name, currentSavedFolderId);
    }, [currentSavedFolderId, handleCreateFolder]);

    const renameCurrentFolder = useCallback(() => {
        if (!currentSavedFolderId) return;
        const folder = folders.find((f) => f.id === currentSavedFolderId);
        if (!folder) return;
        const name = prompt('Rename folder:', folder.name);
        if (name) void handleRenameFolder(folder.id, name);
    }, [currentSavedFolderId, folders, handleRenameFolder]);

    const deleteCurrentFolder = useCallback(() => {
        if (!currentSavedFolderId) return;
        void handleDeleteFolder(currentSavedFolderId);
    }, [currentSavedFolderId, handleDeleteFolder]);

    const resolveFolderName = useCallback(
        (id: string) => folders.find((f) => f.id === id)?.name ?? 'Folder',
        [folders],
    );

    const hasVisits = visits.length !== 0;
    const hasHistory = hasVisits;

    return {
        // Mode + search
        mode,
        setMode,
        searchQuery,
        setSearchQuery,

        // Header
        historyHeaderSubtitle,
        currentThemeName: currentTheme?.name ?? DEFAULT_THEME,
        isThemeModalOpen,
        openThemeModal,
        closeThemeModal,
        openGithubModal,
        closeGithubModal,
        openContactModal,
        closeContactModal,
        isGithubModalOpen,
        isContactModalOpen,
        refreshVisits,
        clearVisits,
        hasHistory,

        // History section
        loading,
        filteredVisits,
        hasVisits,
        savedUrlSet,
        openFolderModal,

        // Saved section
        sidebarNodes,
        isSavedEmpty: folders.length === 0 && totalSavedCount === 0,
        currentFolderName: currentFolder ? currentFolder.name : 'All saved pages',
        breadcrumb: currentFolder ? buildBreadcrumb(folders, currentSavedFolderId) : 'Combined from all folders',
        processedSavedItems,
        currentSavedFolderId,
        resolveFolderName,
        createRootFolder,
        createSubfolder,
        renameCurrentFolder,
        deleteCurrentFolder,
        openCurrentFolderItems,
        onRemoveSavedItem: (folderId: string, url: string) => void handleRemoveSavedItem(folderId, url),
        exportFolders: handleExportFolders,
        importFolders: handleImportFolders,
        importFromChrome: handleImportFromChrome,
        renameSavedItem: handleRenameSavedItem,
        renameSavedTitle: handleRenameSavedTitle,
        manageSavedItem: handleManageSavedItem,

        // Folder modal
        isFolderModalOpen,
        folderModalTitle,
        folderTree,
        folderModalNewName,
        setFolderModalNewName,
        createFolder: (name: string, parentId: string | null = null) => void handleCreateFolder(name, parentId),
        closeFolderModal,
        savePendingVisit: handleSavePendingVisit,

        // Theme modal
        themeId,
        changeTheme: handleThemeChange,

        // First-run tour
        isTourOpen,
        closeTour,
    };
}
