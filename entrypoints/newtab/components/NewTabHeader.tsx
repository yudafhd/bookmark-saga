import React, { useEffect, useMemo, useRef, useState } from 'react';
import { MdCode, MdDelete, MdEmail, MdRefresh, MdSettings } from 'react-icons/md';

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

    const [isMenuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClick = (event: MouseEvent) => {
            if (!menuRef.current) return;
            if (!menuRef.current.contains(event.target as Node)) {
                setMenuOpen(false);
            }
        };
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setMenuOpen(false);
        };
        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('click', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, []);

    return (
        <header className="space-y-2">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
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
                            easy bookmark & history manager
                        </p>
                    </div>
                    <div className="flex gap-1 ml-10">
                        <button
                            type="button"
                            className={`mode-toggle px-3 py-1 text-xs font-medium rounded-sm transition ${mode === 'history' ? 'mode-toggle--active' : ''}`}
                            onClick={() => {
                                onRefresh()
                                onModeChange('history')
                            }}
                            aria-pressed={mode === 'history'}
                        >
                            History
                        </button>
                        <button
                            type="button"
                            className={`mode-toggle px-3 py-1 text-xs font-medium rounded-sm transition ${mode === 'saved' ? 'mode-toggle--active' : ''}`}
                            onClick={() => {
                                onRefresh();
                                onModeChange('saved');
                            }}
                            aria-pressed={mode === 'saved'}
                        >
                            Bookmarks
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        id="search"
                        type="search"
                        placeholder={mode === 'history' ? 'Search visit history…' : 'Search bookmarks…'}
                        value={searchQuery}
                        onChange={(event) => onSearchQueryChange(event.target.value)}
                        className="w-[15rem] rounded-md border border-gray-300/80 bg-white/90  p-2 text-xs text-gray-900 shadow-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                    />

                    <div className="relative" ref={menuRef}>
                        <button
                            type="button"
                            className="bs-btn bs-btn--neutral inline-flex items-center gap-2 px-3 py-2 text-sm font-semibold"
                            aria-haspopup="menu"
                            aria-expanded={isMenuOpen}
                            aria-controls="header-menu"
                            onClick={() => setMenuOpen((v) => !v)}
                            title="Open menu"
                        >
                            <MdSettings size={16} />
                        </button>

                        {isMenuOpen ? (
                            <div
                                id="header-menu"
                                role="menu"
                                className="absolute right-0 z-20 mt-2 w-56 rounded-md bs-surface p-1 shadow-lg"
                            >
                                <button
                                    type="button"
                                    className="w-full text-left px-3 py-2 rounded-sm text-sm"
                                    onClick={() => {
                                        onOpenThemeModal();
                                        setMenuOpen(false);
                                    }}
                                    role="menuitem"
                                >

                                    <span className="hidden sm:inline">{`Theme - ${currentThemeName}`}</span>
                                    <span className="sm:hidden">{currentThemeName.slice(0, 3)}</span>
                                </button>

                                {mode === 'history' ? (
                                    <>
                                        <button
                                            type="button"
                                            className="w-full flex items-center gap-2  text-left px-3 py-2 rounded-sm text-sm"
                                            onClick={() => {
                                                onRefresh();
                                                setMenuOpen(false);
                                            }}
                                            role="menuitem"
                                            title="Refresh view"
                                        >
                                            <MdRefresh size={16} /> Refresh
                                        </button>

                                        <button
                                            type="button"
                                            className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-sm text-sm"
                                            onClick={() => {
                                                onClearHistory();
                                                setMenuOpen(false);
                                            }}
                                            role="menuitem"
                                            title="Clear saved history"
                                        >
                                            <MdDelete size={16} /> Clear history
                                        </button>

                                    </>
                                ) : null}

                                <button
                                    type="button"
                                    className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-sm text-sm"
                                    onClick={() => {
                                        onOpenGithubModal();
                                        setMenuOpen(false);
                                    }}
                                    role="menuitem"
                                >
                                    <MdCode size={16} />
                                    GitHub
                                </button>
                                <button
                                    type="button"
                                    className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-sm text-sm"
                                    onClick={() => {
                                        onOpenContactModal();
                                        setMenuOpen(false);
                                    }}
                                    role="menuitem"
                                >
                                    <MdEmail size={16} />
                                    Contact
                                </button>
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default NewTabHeader;
