import React from 'react';
import { THEMES } from '@/lib/themes';
import type { ThemeId } from '@/lib/types';
import { XIcon } from '@/shared/icons';

interface ThemeModalProps {
    open: boolean;
    currentThemeId: ThemeId;
    onClose: () => void;
    onChangeTheme: (id: ThemeId) => Promise<void> | void;
}

const ThemeModal: React.FC<ThemeModalProps> = ({ open, currentThemeId, onClose, onChangeTheme }) => {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 flex !mt-0 items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <div className="max-h-[80vh] overflow-y-auto bs-surface max-w-md w-full p-6 rounded-2xl border border-white/40 space-y-4">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold">Choose Theme</h2>
                        <p className="text-sm opacity-70">Customize Bookmark Saga’s look to your preferred style.</p>
                    </div>
                    <button
                        type="button"
                        className="bs-btn bs-btn--ghost text-sm px-3 py-1.5"
                        onClick={onClose}
                    >
                        <XIcon className="w-4" />
                    </button>
                </div>

                <div className="space-y-3">
                    {THEMES.map((theme) => {
                        const active = theme.id === currentThemeId;
                        return (
                            <button
                                key={theme.id}
                                type="button"
                                className={`theme-option${active ? ' theme-option--active' : ''}`}
                                onClick={() => onChangeTheme(theme.id)}
                                aria-pressed={active}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <div className="text-left">
                                        <p className="theme-option-title">{theme.name}</p>
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
                        onClick={() => onChangeTheme('default')}
                    >
                        Reset to Default
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThemeModal;