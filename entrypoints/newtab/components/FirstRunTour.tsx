import React from 'react';
import { XIcon } from '@/shared/icons';

interface FirstRunTourProps {
    open: boolean;
    onClose: () => void;
}

const FirstRunTour: React.FC<FirstRunTourProps> = ({ open, onClose }) => {
    if (!open) return null;

    const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.target === event.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 flex !mt-0 items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            onClick={handleContainerClick}
        >
            <div
                className="bs-surface w-full max-w-lg space-y-5 rounded-2xl border border-white/30 p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-xl font-semibold">Welcome to Bookmark Saga</h2>
                        <p className="text-sm opacity-70">
                            A quick tour to get you started. You can see this again later.
                        </p>
                    </div>
                    <button
                        type="button"
                        className="bs-btn bs-btn--neutral text-sm px-3 py-1.5"
                        onClick={onClose}
                        aria-label="Close"
                    >
                        <XIcon className="w-4" />
                    </button>
                </div>

                <ol className="space-y-3 text-sm">
                    <li className="bs-card p-3 rounded-md">
                        <p className="font-semibold">1. History mode</p>
                        <p className="opacity-70">
                            Browse your recent visits. Use the Save button to collect pages.
                        </p>
                    </li>
                    <li className="bs-card p-3 rounded-md">
                        <p className="font-semibold">2. Bookmarks mode</p>
                        <p className="opacity-70">
                            Organize saved pages into folders and subfolders. Use the menu to import/export.
                        </p>
                    </li>
                    <li className="bs-card p-3 rounded-md">
                        <p className="font-semibold">3. Search</p>
                        <p className="opacity-70">
                            The search box filters either history or bookmarks depending on the active mode.
                        </p>
                    </li>
                    <li className="bs-card p-3 rounded-md">
                        <p className="font-semibold">4. Themes</p>
                        <p className="opacity-70">
                            Open the menu to switch themes. Changes apply instantly.
                        </p>
                    </li>
                </ol>

                <div className="flex items-center justify-end gap-2">
                    <button
                        type="button"
                        className="bs-btn bs-btn--neutral px-4 py-2 text-sm font-medium"
                        onClick={onClose}
                    >
                        Skip
                    </button>
                    <button
                        type="button"
                        className="bs-btn bs-btn--primary px-4 py-2 text-sm font-semibold"
                        onClick={onClose}
                    >
                        Start using
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FirstRunTour;