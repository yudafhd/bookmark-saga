import React, { useEffect, useRef, useState } from 'react';
import type { FolderItem } from '@/lib/types';
import { MdAdd, MdDelete, MdDownload, MdEdit, MdFolder, MdMoreHoriz, MdMoreVert, MdOpenInNew, MdStar, MdUpload } from 'react-icons/md';
import ItemActionsMenu from './ItemActionsMenu';
import { FaRegFolder } from 'react-icons/fa';

interface BookmarkSectionItem extends FolderItem {
    folderId: string;
    host: string;
    savedLabel: string | null;
    visitLabel: string | null;
}

interface BookmarkSectionProps {
    sidebarNodes: React.ReactNode[];
    isEmpty: boolean;
    currentFolderName: string;
    breadcrumb: string;
    savedItems: BookmarkSectionItem[];
    currentSavedFolderId: string | null;
    resolveFolderName: (folderId: string) => string;
    onCreateRootFolder: () => void;
    onCreateSubfolder: () => void;
    onRenameFolder: () => void;
    onDeleteFolder: () => void;
    onRemoveSavedItem: (folderId: string, url: string) => void;
    onExportFolders: () => void;
    onImportFolders: (file: File) => void | Promise<void>;
    onImportFromChrome: () => void | Promise<void>;
    onRenameSavedItem?: (folderId: string, url: string) => void;
    onRenameSavedTitle?: (folderId: string, url: string, currentTitle: string) => void;
    onManageSavedItem: (folderId: string, item: BookmarkSectionItem) => void;
    onOpenAllSavedItems: (items: BookmarkSectionItem[]) => void;
}

const BookmarkSection: React.FC<BookmarkSectionProps> = ({
    sidebarNodes,
    isEmpty,
    currentFolderName,
    breadcrumb,
    savedItems,
    currentSavedFolderId,
    resolveFolderName,
    onCreateRootFolder,
    onCreateSubfolder,
    onRenameFolder,
    onDeleteFolder,
    onRemoveSavedItem,
    onExportFolders,
    onImportFolders,
    onImportFromChrome,
    onRenameSavedItem,
    onRenameSavedTitle,
    onManageSavedItem,
    onOpenAllSavedItems,
}) => {
    const visibleCount = savedItems.length;
    const emptyFolderMessage = currentSavedFolderId
        ? 'This folder is waiting for its first saved page.'
        : 'Save pages from the history timeline to start building your collection.';

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isImportModalOpen, setImportModalOpen] = useState(false);
    const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
    const actionMenuRef = useRef<HTMLDivElement>(null);
    const [isActionMenuOpen, setActionMenuOpen] = useState(false);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (!actionMenuRef.current) return;
            if (!actionMenuRef.current.contains(event.target as Node)) {
                setActionMenuOpen(false);
            }
        };
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setActionMenuOpen(false);
        };
        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('click', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, []);

    const openFilePicker = () => {
        const input = fileInputRef.current;
        if (!input) return;
        if (typeof input.showPicker === 'function') {
            input.showPicker();
        } else {
            input.click();
        }
    };


    return (
        <section className="space-y-8" id="bookmarkSection">
            <div className="grid gap-6 lg:grid-cols-[300px,1fr]">
                <aside className="bs-surface rounded-md p-4 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-sm font-semibold uppercase tracking-wide">Bookmarks</h2>
                        <div className="relative" ref={actionMenuRef}>
                            <button
                                type="button"
                                className="bs-btn bs-btn--neutral inline-flex items-center gap-2 px-2 py-1 text-xs font-semibold"
                                aria-haspopup="menu"
                                aria-expanded={isActionMenuOpen}
                                aria-controls="bookmark-actions-menu"
                                onClick={() => setActionMenuOpen((v) => !v)}
                                title="Open actions"
                            >
                                <MdMoreHoriz size={18} />
                            </button>

                            {isActionMenuOpen ? (
                                <div
                                    id="bookmark-actions-menu"
                                    role="menu"
                                    className="absolute right-0 z-20 mt-2 w-56 rounded-md bs-surface p-1 shadow-lg"
                                >
                                    <button
                                        type="button"
                                        className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-sm text-sm disabled:opacity-50"
                                        onClick={() => {
                                            onExportFolders();
                                            setActionMenuOpen(false);
                                        }}
                                        role="menuitem"
                                        disabled={isEmpty}
                                    >
                                        <MdDownload size={18} />
                                        Export bookmarks
                                    </button>

                                    <button
                                        type="button"
                                        className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-sm text-sm"
                                        onClick={() => {
                                            setImportModalOpen(true);
                                            setActionMenuOpen(false);
                                        }}
                                        role="menuitem"
                                    >
                                        <MdUpload size={18} />
                                        Import bookmarks
                                    </button>

                                    <button
                                        type="button"
                                        className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-sm text-sm"
                                        onClick={() => {
                                            onCreateRootFolder();
                                            setActionMenuOpen(false);
                                        }}
                                        role="menuitem"
                                    >
                                        <MdAdd size={18} />
                                        Create root folder
                                    </button>
                                </div>
                            ) : null}
                        </div>
                    </div>
                    <p className="mt-2 text-xs opacity-70">
                        Organize saved pages by creating folders and nested collections.
                    </p>
                    <nav className="mt-4 max-h-[360px] space-y-1 overflow-y-auto pr-1 text-sm">
                        {sidebarNodes}
                    </nav>
                </aside>
                <div className="space-y-3">
                    <header className="rounded-lg">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <FaRegFolder size={20} />
                                    <h2 className="text-xl font-semibold">
                                        {currentFolderName || 'All saved pages'}
                                    </h2>
                                </div>
                                <p className="mt-2 text-sm opacity-70">
                                    {currentFolderName ? breadcrumb : 'Combined from every folder and subfolder.'}
                                </p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    className="bs-btn bs-btn--primary flex items-center gap-2 px-3 py-2 text-xs font-semibold"
                                    onClick={() => onOpenAllSavedItems(savedItems)}
                                    disabled={visibleCount === 0}
                                    title="Open all saved items in new tabs"
                                >
                                    <MdOpenInNew size={16} />
                                    Open all
                                </button>
                                {currentFolderName !== 'All saved pages' ? (
                                    <>
                                        <button
                                            type="button"
                                            className="bs-btn flex items-center gap-2 px-3 py-2 text-xs font-semibold"
                                            onClick={onCreateSubfolder}
                                            disabled={!currentSavedFolderId}
                                        >
                                            <MdAdd size={16} />
                                            <span className="sr-only">Create subfolder</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="bs-btn bs-btn--neutral flex items-center gap-2 px-3 py-2 text-xs font-semibold"
                                            onClick={onRenameFolder}
                                            disabled={!currentSavedFolderId}
                                        >
                                            <MdEdit size={16} />
                                            <span className="sr-only">Edit subfolder</span>
                                        </button>
                                        <button
                                            type="button"
                                            className="bs-btn flex items-center gap-2 px-3 py-2 text-xs font-semibold"
                                            onClick={onDeleteFolder}
                                            disabled={!currentSavedFolderId}
                                        >
                                            <MdDelete size={16} />
                                            <span className="sr-only">Delete subfolder</span>
                                        </button>
                                    </>
                                ) : null}
                            </div>

                        </div>
                    </header>
                    {isEmpty ? (
                        <div className="rounded-lg p-12 text-center shadow-sm">
                            <p className="text-lg font-semibold">Nothing saved yet</p>
                            <p className="mt-2 text-sm opacity-70">
                                Pin your favorite pages from the history timeline to build your first collection.
                            </p>
                        </div>
                    ) : visibleCount === 0 ? (
                        <div className="p-10 text-center">
                            <p className="text-lg font-semibold">This folder is empty</p>
                            <p className="mt-2 text-sm opacity-70">{emptyFolderMessage}</p>
                        </div>
                    ) : (
                        <ul className="grid grid-cols-1 gap-1">
                            {savedItems.map((item) => (
                                <li
                                    key={`${item.folderId}-${item.url}`}
                                    className={`rounded-lg bs-surface px-3 py-2 ${openMenuKey === item.folderId + '-' + item.url ? 'relative z-[60]' : ''}`}
                                >
                                    <div className="flex items-center gap-4">
                                        <img
                                            src={item.faviconUrl}
                                            alt=""
                                            className="h-7 w-7 rounded"
                                            loading="lazy"
                                        />
                                        <div className="min-w-0 flex-1 space-y-2">
                                            <a
                                                href={item.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="line-clamp-2 text-sm font-semibold text-blue-600 transition hover:underline dark:text-blue-400"
                                            >
                                                {item.title || item.host}
                                            </a>
                                            <div className="flex flex-wrap gap-2 text-xs opacity-[0.5]">
                                                <span className="truncate rounded-full">
                                                    {item.host}
                                                </span>
                                                {item.savedLabel ? (
                                                    <span className="px-2 py-0.5">
                                                        {item.savedLabel}
                                                    </span>
                                                ) : null}
                                                {item.visitLabel ? (
                                                    <span className="px-2 py-0.5">
                                                        {item.visitLabel}
                                                    </span>
                                                ) : null}
                                                {!currentSavedFolderId ? (
                                                    <span className="px-2 py-0.5">
                                                        {resolveFolderName(item.folderId)}
                                                    </span>
                                                ) : null}
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <ItemActionsMenu
                                                open={openMenuKey === item.folderId + '-' + item.url}
                                                onOpenChange={(v) =>
                                                    setOpenMenuKey(
                                                        v
                                                            ? item.folderId + '-' + item.url
                                                            : (openMenuKey === item.folderId + '-' + item.url ? null : openMenuKey)
                                                    )
                                                }
                                                onManage={() => onManageSavedItem(item.folderId, item)}
                                                onRenameUrl={() => onRenameSavedItem?.(item.folderId, item.url)}
                                                onRenameTitle={() => onRenameSavedTitle?.(item.folderId, item.url, item.title || item.host)}
                                                onRemove={() => onRemoveSavedItem(item.folderId, item.url)}
                                            />
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="sr-only"
                tabIndex={-1}
                onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) {
                        void Promise.resolve(onImportFolders(file)).finally(() => setImportModalOpen(false));
                    }
                    if (event.target) {
                        event.target.value = '';
                    }
                }}
            />

            {isImportModalOpen ? (
                <div
                    className="fixed inset-0 z-50 bg-black/50 flex !mt-0 items-center justify-center px-4"
                    role="dialog"
                    aria-modal="true"
                    onClick={() => setImportModalOpen(false)}
                >
                    <div
                        className="bs-surface w-full max-w-sm space-y-4 rounded-lg border border-white/20 p-6"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <header className="space-y-1">
                            <h3 className="text-lg font-semibold">Import bookmarks</h3>
                            <p className="text-sm opacity-70">
                                Choose how you want to bring bookmarks into Bookmark Saga.
                            </p>
                        </header>
                        <div className="space-y-3">
                            <button
                                type="button"
                                className="bs-btn bs-btn--neutral w-full justify-between px-4 py-3 text-sm font-semibold"
                                onClick={() => {
                                    openFilePicker();
                                }}
                            >
                                <span>From Bookmark Saga export (.json)</span>
                                <MdUpload size={18} />
                            </button>
                            <button
                                type="button"
                                className="bs-btn bs-btn--neutral w-full justify-between px-4 py-3 text-sm font-semibold"
                                onClick={() => {
                                    void Promise.resolve(onImportFromChrome()).finally(() => setImportModalOpen(false));
                                }}
                            >
                                <span>From Google Chrome bookmarks</span>
                                <MdStar size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            ) : null}
        </section>
    );
};

export default BookmarkSection;
