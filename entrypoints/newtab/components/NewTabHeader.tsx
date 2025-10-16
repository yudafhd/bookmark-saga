import React from 'react';
import type { Mode } from '@/entrypoints/newtab/types';
import { RefreshCw, TrashIcon } from '@/shared/icons';

interface NewTabHeaderProps {
    iconSrc: string;
    subtitle: string;
    mode: Mode;
    onModeChange: (mode: Mode) => void;
    searchQuery: string;
    onSearchQueryChange: (value: string) => void;
    currentThemeName: string;
    onOpenThemeModal: () => void;
    isThemeModalOpen: boolean;
    onRefresh: () => void;
    onClearHistory: () => void;
    hasHistory: boolean;
}

const NewTabHeader: React.FC<NewTabHeaderProps> = ({
    iconSrc,
    subtitle,
    mode,
    onModeChange,
    searchQuery,
    onSearchQueryChange,
    currentThemeName,
    onOpenThemeModal,
    isThemeModalOpen,
    onRefresh,
    onClearHistory,
    hasHistory,
}) => {
    return (
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="flex items-start gap-3">
                <img
                    src={iconSrc}
                    alt="Bookmark Saga logo"
                    className="h-12 w-12 rounded-sm shadow-sm"
                    loading="lazy"
                />
                <div>
                    <h1 className="text-2xl font-bold">Bookmark Saga</h1>
                    <p className="opacity-70" id="headerSubtitle">
                        {subtitle}
                    </p>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <div className="flex gap-2">
                    <button
                        type="button"
                        className={`mode-toggle px-3 py-1 text-xs font-medium rounded-sm transition ${mode === 'history' ? 'mode-toggle--active' : ''}`}
                        onClick={() => onModeChange('history')}
                        aria-pressed={mode === 'history'}
                    >
                        History
                    </button>
                    <button
                        type="button"
                        className={`mode-toggle px-3 py-1 text-xs font-medium rounded-sm transition ${mode === 'saved' ? 'mode-toggle--active' : ''}`}
                        onClick={() => onModeChange('saved')}
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
                    onChange={(event) => onSearchQueryChange(event.target.value)}
                    className="w-full sm:w-60 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-sm bg-white/90 dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                />
                <div className="flex gap-2">
                    <button
                        type="button"
                        className="bs-btn bs-btn--accent px-4 py-2 rounded-sm font-medium"
                        onClick={onOpenThemeModal}
                        aria-expanded={isThemeModalOpen}
                    >
                        Theme · {currentThemeName}
                    </button>
                    <button
                        type="button"
                        className="bs-btn bs-btn--primary px-4 py-2"
                        onClick={onRefresh}
                    >
                        <RefreshCw className="w-4" />
                        Refresh
                    </button>
                    {hasHistory && (
                        <button
                            type="button"
                            className="bs-btn bs-btn--danger px-4 py-2"
                            onClick={onClearHistory}
                        >
                            <TrashIcon className="w-4" />
                            Clear History
                        </button>
                    )}
                </div>
            </div>
        </header>
    );
};

export default NewTabHeader;