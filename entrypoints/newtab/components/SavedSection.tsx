import React from 'react';
import type { FolderItem } from '@/lib/types';
import { FolderClosed, Plus, EditIcon, TrashIcon, StarSolid, XIcon } from '@/shared/icons';

interface SavedItemSection extends FolderItem {
    folderId: string;
    host: string;
    savedLabel: string | null;
    visitLabel: string | null;
}

interface SavedSectionProps {
    sidebarNodes: React.ReactNode[];
    isEmpty: boolean;
    currentFolderName: string;
    breadcrumb: string;
    savedItems: SavedItemSection[];
    currentSavedFolderId: string | null;
    resolveFolderName: (folderId: string) => string;
    onCreateRootFolder: () => void;
    onCreateSubfolder: () => void;
    onRenameFolder: () => void;
    onDeleteFolder: () => void;
    onRemoveSavedItem: (folderId: string, url: string) => void;
}

const SavedSection: React.FC<SavedSectionProps> = ({
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
}) => {
    const visibleCount = savedItems.length;
    const emptyFolderMessage = currentSavedFolderId
        ? 'This folder is waiting for its first saved page.'
        : 'Save pages from the history timeline to start building your collection.';

    return (
        <section className="space-y-8" id="savedSection">
            <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
                <aside className="bs-surface rounded-md p-4 space-y-4">
                    <div className="flex items-center justify-between gap-3">
                        <h2 className="text-sm font-semibold uppercase tracking-wide">Collections</h2>
                        <button
                            type="button"
                            className="bs-btn bs-btn--neutral px-2 py-1 text-xs"
                            onClick={onCreateRootFolder}
                        >
                            <Plus className="w-4" />
                            <span className="sr-only">Create root folder</span>
                        </button>
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
                                    <FolderClosed className="w-5" />
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
                                    className="bs-btn bs-btn--success flex items-center gap-2 px-3 py-2 text-xs font-semibold"
                                    onClick={onCreateSubfolder}
                                    disabled={!currentSavedFolderId}
                                >
                                    <Plus className="w-4" />
                                </button>
                                <button
                                    type="button"
                                    className="bs-btn bs-btn--neutral flex items-center gap-2 px-3 py-2 text-xs font-semibold"
                                    onClick={onRenameFolder}
                                    disabled={!currentSavedFolderId}
                                >
                                    <EditIcon className="w-4" />
                                </button>
                                <button
                                    type="button"
                                    className="bs-btn bs-btn--danger flex items-center gap-2 px-3 py-2 text-xs font-semibold"
                                    onClick={onDeleteFolder}
                                    disabled={!currentSavedFolderId}
                                >
                                    <TrashIcon className="w-4" />
                                </button>
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
                                    className="rounded-lg bs-surface px-3 py-2"
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
                                                <span className="truncate rounded-full px-2 py-0.5">
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
                                        <div>
                                            <button
                                                type="button"
                                                className="px-2"
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    onRemoveSavedItem(item.folderId, item.url);
                                                }}
                                            >
                                                <XIcon className="w-4" />
                                            </button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </section>
    );
};

export default SavedSection;
