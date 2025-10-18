import React, { useMemo } from 'react';
import { RefreshCw, TrashIcon, Search, GithubIcon, MailIcon } from '@/shared/icons';

interface NewTabHeaderProps {
    subtitle: string;
    mode: 'history' | 'saved';
    onModeChange: (mode: 'history' | 'saved') => void;
    searchQuery: string;
    onSearchQueryChange: (value: string) => void;
    currentThemeName: string;
    onOpenThemeModal: () => void;
    isThemeModalOpen: boolean;
    onRefresh: () => void;
    onClearHistory: () => void;
    hasHistory: boolean;
    onOpenGithubModal: () => void;
    onOpenContactModal: () => void;
}

const NewTabHeader: React.FC<NewTabHeaderProps> = ({
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
    onOpenGithubModal,
    onOpenContactModal,
}) => {
    const iconSrc = useMemo(() => {
        if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
            return chrome.runtime.getURL('icons/icon48.png');
        }
        return '/icons/icon48.png';
    }, []);
    return (
        <header className="space-y-2">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-3">
                    <img
                        src={iconSrc}
                        alt="Bookmark Saga logo"
                        className="h-12 w-12 rounded-sm shadow-sm"
                        loading="lazy"
                    />
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold">Bookmark Saga</h1>
                        <p className="text-sm opacity-70" id="headerSubtitle">
                            {subtitle}
                        </p>
                    </div>
                    <div className="flex gap-1 ml-10">
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
                            Bookmarks
                        </button>
                    </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                    <button
                        type="button"
                        className="bs-btn bs-btn--accent px-3 py-2 text-xs"
                        onClick={onOpenThemeModal}
                        aria-expanded={isThemeModalOpen}
                    >
                        <span className="hidden sm:inline">{currentThemeName}</span>
                        <span className="sm:hidden">{currentThemeName.slice(0, 3)}</span>
                    </button>
                    {mode === 'history' && <div className="relative flex-1 lg:max-w-md">

                        <input
                            id="search"
                            type="search"
                            placeholder="Search visit history…"
                            value={searchQuery}
                            onChange={(event) => onSearchQueryChange(event.target.value)}
                            className="w-full rounded-md border border-gray-300/80 bg-white/90  p-2 text-xs text-gray-900 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        />
                    </div>}

                    {mode === 'history' ? (
                        <>
                            <button
                                type="button"
                                className="bs-btn bs-btn--neutral inline-flex items-center gap-2 px-3 py-2 font-semibold"
                                onClick={onRefresh}
                                title="Refresh view"
                            >
                                <RefreshCw className="h-3 w-3" />
                            </button>
                            {hasHistory ? (
                                <button
                                    type="button"
                                    className="bs-btn bs-btn--danger inline-flex items-center gap-2 px-3 py-2 font-semibold"
                                    onClick={onClearHistory}
                                    title="Clear saved history"
                                >
                                    <TrashIcon className="h-3 w-3" />
                                </button>
                            ) : null}
                        </>
                    ) : null}
                    <button
                        type="button"
                        className="bs-btn bs-btn--neutral inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold"
                        onClick={onOpenGithubModal}
                        title="View project on GitHub"
                    >
                        <GithubIcon className="h-3 w-3" />
                    </button>
                    <button
                        type="button"
                        className="bs-btn bs-btn--neutral inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold"
                        onClick={onOpenContactModal}
                        title="Contact the author"
                    >
                        <MailIcon className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default NewTabHeader;
