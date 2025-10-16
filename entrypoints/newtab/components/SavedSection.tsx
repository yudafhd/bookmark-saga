import React from 'react';
import type { FolderItem } from '@/lib/types';
import { FolderClosed, Plus, EditIcon, TrashIcon, StarSolid } from '@/shared/icons';

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
    return (
        <section className="space-y-6" id="savedSection">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                <aside className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold uppercase tracking-wide">Folders</h2>
                        <button
                            type="button"
                            className="bs-btn bs-btn--neutral text-xs px-2 py-1"
                            onClick={onCreateRootFolder}
                        >
                            <Plus className="w-4" />
                        </button>
                    </div>
                    <nav className="space-y-1 text-sm">{sidebarNodes}</nav>
                </aside>
                <div className="col-span-4 space-y-4">
                    {isEmpty ? (
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
                                    <div className="flex gap-2">
                                        <FolderClosed className="w-4" />
                                        <h2 className="text-xl font-semibold">
                                            {currentFolderName || 'All saved pages'}
                                        </h2>
                                    </div>
                                    <p className="text-sm opacity-70">
                                        {currentFolderName ? breadcrumb : 'Combined from all folders'}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        className="bs-btn bs-btn--success px-3 py-1 text-sm"
                                        onClick={onCreateSubfolder}
                                        disabled={!currentSavedFolderId}
                                    >
                                        <Plus className="w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        className="bs-btn bs-btn--neutral px-3 py-1 text-sm"
                                        onClick={onRenameFolder}
                                        disabled={!currentSavedFolderId}
                                    >
                                        <EditIcon className="w-4" />
                                    </button>
                                    <button
                                        type="button"
                                        className="bs-btn bs-btn--danger px-3 py-1 text-sm"
                                        onClick={onDeleteFolder}
                                        disabled={!currentSavedFolderId}
                                    >
                                        <TrashIcon className="w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="bs-surface max-w-[80vw] rounded-sm border border-transparent shadow-sm">
                                {savedItems.length === 0 ? (
                                    <p className="px-4 py-6 text-sm text-gray-500 dark:text-gray-400">
                                        {currentSavedFolderId ? 'No items in this folder yet.' : 'No items saved yet.'}
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
                                                    <span>{new URL(item.url).host}</span>
                                                    {item.savedAt ? <span>Saved {item.savedAt}</span> : null}
                                                    {item.visitTime ? <span>Visited {item.visitTime}</span> : null}
                                                    {!currentSavedFolderId && (
                                                        <span className="px-2 py-0.5 rounded-sm bg-gray-200/70 dark:bg-gray-700/70 text-gray-600 dark:text-gray-300">
                                                            {resolveFolderName(item.folderId)}
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
                                                        onRemoveSavedItem(item.folderId, item.url);
                                                    }}
                                                >
                                                    <StarSolid className="w-4" />
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
    );
};

export default SavedSection;