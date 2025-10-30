import React, { useEffect, useMemo, useState } from 'react';
import {
    readFolderItems,
    readFolders,
    readTheme,
    writeFolderItems,
    writeFolders,
} from '@/lib/storage';
import { ensureFolderItemsMap, getFolderChildren, normalizeHierarchy } from '@/lib/folder-utils';
import type { Folder, FolderItemsMap } from '@/lib/types';
import { getHostName, isValidVisitUrl, resolveFavicon } from '@/lib/utils';

type FeedbackType = 'success' | 'error' | 'info';

interface FeedbackState {
    type: FeedbackType;
    message: string;
}

interface ActiveTabInfo {
    url: string;
    title: string;
    faviconUrl?: string;
}

function generateFolderId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return `folder_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function getActiveTab(): Promise<chrome.tabs.Tab | null> {
    return new Promise((resolve) => {
        try {
            if (!chrome?.tabs?.query) {
                resolve(null);
                return;
            }
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                resolve(tabs?.[0] ?? null);
            });
        } catch {
            resolve(null);
        }
    });
}

function isDuplicateName(folders: Folder[], name: string): boolean {
    return folders.some((folder) => folder.name.toLowerCase() === name.toLowerCase());
}

const Popup: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [folders, setFolders] = useState<Folder[]>([]);
    const [folderItems, setFolderItems] = useState<FolderItemsMap>({});
    const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ActiveTabInfo | null>(null);
    const [feedback, setFeedback] = useState<FeedbackState | null>(null);
    const [saving, setSaving] = useState(false);
    const [creating, setCreating] = useState(false);
    const folderSelected = folders.find((folder) => folder.id === selectedFolderId)?.name ?? 'folder';
    const folderName = folderSelected ? `${folderSelected}` : 'Folder';

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [storedFolders, storedItems, theme] = await Promise.all([
                    readFolders(),
                    readFolderItems(),
                    readTheme(),
                ]);
                if (theme) {
                    document.body.dataset.theme = theme;
                }
                const normalized = normalizeHierarchy(storedFolders);
                const ensured = ensureFolderItemsMap(normalized, storedItems);
                setFolders(normalized);
                setFolderItems(ensured);
                if (normalized.length > 0) {
                    setSelectedFolderId((current) => current ?? normalized[0].id);
                } else {
                    setSelectedFolderId(null);
                }
            } catch (error) {
                console.error('Failed to load folders', error);
                setFeedback({ type: 'error', message: 'Unable to load folders.' });
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, []);

    useEffect(() => {
        const fetchTab = async () => {
            const tab = await getActiveTab();
            if (!tab?.url || !isValidVisitUrl(tab.url)) {
                setActiveTab(null);
                return;
            }
            setActiveTab({
                url: tab.url,
                title: tab.title ?? tab.url,
                faviconUrl: typeof tab.favIconUrl === 'string' ? tab.favIconUrl : undefined,
            });
        };
        void fetchTab();
    }, []);

    const folderOptions = useMemo(() => {
        const list: { id: string; label: string }[] = [];
        const build = (parentId: string | null, depth: number) => {
            for (const folder of getFolderChildren(folders, parentId)) {
                const prefix = depth > 0 ? `${'  '.repeat(depth)}- ` : '';
                list.push({ id: folder.id, label: `${prefix}${folder.name}` });
                build(folder.id, depth + 1);
            }
        };
        build(null, 0);
        return list;
    }, [folders]);

    useEffect(() => {
        if (!selectedFolderId && folderOptions.length > 0) {
            setSelectedFolderId(folderOptions[0].id);
        }
    }, [folderOptions, selectedFolderId]);

    const handleCreateFolder = async () => {
        const name = prompt('New folder name:')?.trim();
        if (!name) return;
        if (isDuplicateName(folders, name)) {
            setFeedback({ type: 'error', message: 'A folder with that name already exists.' });
            return;
        }
        setCreating(true);
        try {
            const newFolder: Folder = { id: generateFolderId(), name, parentId: null };
            const nextFolders = [...folders, newFolder];
            await writeFolders(nextFolders);
            const nextItems = { ...folderItems, [newFolder.id]: [] };
            await writeFolderItems(nextItems);
            setFolders(nextFolders);
            setFolderItems(nextItems);
            setSelectedFolderId(newFolder.id);
            setFeedback({ type: 'success', message: `Created folder "${name}".` });
        } catch (error) {
            console.error('Failed to create folder', error);
            setFeedback({ type: 'error', message: 'Unable to create folder.' });
        } finally {
            setCreating(false);
        }
    };

    const handleSave = async () => {
        if (!selectedFolderId) {
            setFeedback({ type: 'error', message: 'Select a folder first.' });
            return;
        }
        setSaving(true);
        try {
            const tab = await getActiveTab();
            if (!tab?.url || !isValidVisitUrl(tab.url)) {
                setFeedback({ type: 'error', message: 'This page cannot be saved.' });
                return;
            }
            const url = tab.url;
            const title = (tab.title ?? url).trim() || url;
            const favIconUrl = typeof tab.favIconUrl === 'string' ? tab.favIconUrl : null;
            const entry = {
                url,
                title,
                faviconUrl: resolveFavicon(url, favIconUrl),
                savedAt: Date.now(),
                visitTime: null,
            };
            const existing = folderItems[selectedFolderId] ?? [];
            if (existing.some((item) => item.url === url)) {
                setFeedback({ type: 'info', message: 'Already saved in this folder.' });
                return;
            }
            const nextItems = {
                ...folderItems,
                [selectedFolderId]: [entry, ...existing],
            };
            await writeFolderItems(nextItems);
            setFolderItems(nextItems);
            setFeedback({ type: 'success', message: `Saved to "${folderName}".` });
        } catch (error) {
            console.error('Failed to save bookmark', error);
            setFeedback({ type: 'error', message: 'Unable to save bookmark.' });
        } finally {
            setSaving(false);
        }
    };

    const activeHost = activeTab ? getHostName(activeTab.url) : null;

    return (
        <div className="space-y-4 p-4 text-sm">
            <header className="space-y-1">
                <h1 className="text-base font-semibold">Bookmark Saga</h1>
                <p className="text-xs opacity-70">Quick save from the extension toolbar.</p>
            </header>
            {activeTab ? (
                <>
                    <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide opacity-80">
                        Link
                    </label>
                    <div className="flex items-center gap-3 rounded-md bg-white/5 p-3">

                        <img
                            src={activeTab.faviconUrl ?? resolveFavicon(activeTab.url)}
                            alt=""
                            className="h-8 w-8 rounded"
                        />
                        <div className="min-w-0">
                            <p className="truncate font-medium">{activeTab.title}</p>
                            <p className="truncate text-xs opacity-70">{activeHost}</p>
                        </div>
                    </div>
                </>
            ) : (
                <p className="rounded-md bg-white/5 p-3 text-xs opacity-80">
                    Open a website to save it to Bookmark Saga.
                </p>
            )}

            <div className="space-y-2">
                <label className="flex flex-col gap-1 text-xs font-semibold uppercase tracking-wide opacity-80">
                    Folder
                    <select
                        className="rounded-md border border-white/10 bg-white/10 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:bg-white/15"
                        value={selectedFolderId ?? ''}
                        onChange={(event) => setSelectedFolderId(event.target.value || null)}
                        disabled={loading || folderOptions.length === 0}
                    >
                        {folderOptions.length === 0 ? (
                            <option value="">No folders available</option>
                        ) : (
                            folderOptions.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.label}
                                </option>
                            ))
                        )}
                    </select>
                </label>
                <button
                    type="button"
                    className="bs-btn bs-btn--neutral w-full justify-center px-3 py-2 text-xs font-semibold"
                    onClick={() => {
                        void handleCreateFolder();
                    }}
                    disabled={creating}
                >
                    {creating ? 'Creating folder…' : 'Create new folder'}
                </button>
            </div>

            <button
                type="button"
                className="bs-btn bs-btn--primary w-full justify-center px-4 py-2 text-sm font-semibold disabled:opacity-50"
                onClick={() => {
                    void handleSave();
                }}
                disabled={saving || !activeTab || !selectedFolderId}
            >
                {saving ? 'Saving…' : `Save To ${folderName}`}
            </button>

            {feedback ? (
                <p
                    className={[
                        'rounded-md px-3 py-2 text-xs font-medium',
                        feedback.type === 'success' ? 'bg-emerald-500/20 text-emerald-200' : '',
                        feedback.type === 'error' ? 'bg-red-500/20 text-red-200' : '',
                        feedback.type === 'info' ? 'bg-blue-500/20 text-blue-200' : '',
                    ].join(' ')}
                >
                    {feedback.message}
                </p>
            ) : null}
        </div>
    );
};

export default Popup;
