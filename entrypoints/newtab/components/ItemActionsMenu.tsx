import React, { useEffect, useRef } from 'react';
import { Menu, StarSolid, EditIcon, Settings, XIcon } from '@/shared/icons';

interface ItemActionsMenuProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onManage: () => void;
    onRenameUrl: () => void;
    onRenameTitle: () => void;
    onRemove: () => void;
}

const ItemActionsMenu: React.FC<ItemActionsMenuProps> = ({
    open,
    onOpenChange,
    onManage,
    onRenameUrl,
    onRenameTitle,
    onRemove,
}) => {
    const ref = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                onOpenChange(false);
            }
        };
        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onOpenChange(false);
        };
        document.addEventListener('click', handleClick);
        document.addEventListener('keydown', handleKey);
        return () => {
            document.removeEventListener('click', handleClick);
            document.removeEventListener('keydown', handleKey);
        };
    }, [onOpenChange]);

    return (
        <div className="relative" ref={ref}>
            <button
                type="button"
                className="px-2"
                aria-haspopup="menu"
                aria-expanded={open}
                onClick={(e) => {
                    e.preventDefault();
                    onOpenChange(!open);
                }}
                aria-label="Open actions"
                title="Open actions"
            >
                <Menu className="w-4" />
            </button>

            {open ? (
                <div
                    role="menu"
                    className="absolute right-0 z-[70] mt-2 w-48 rounded-md bs-surface p-1 shadow-lg"
                >
                    <button
                        type="button"
                        className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-sm text-sm"
                        onClick={(e) => {
                            e.preventDefault();
                            onManage();
                            onOpenChange(false);
                        }}
                        role="menuitem"
                    >
                        <StarSolid className="w-4" />
                        Manage folders
                    </button>

                    <button
                        type="button"
                        className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-sm text-sm"
                        onClick={(e) => {
                            e.preventDefault();
                            onRenameUrl();
                            onOpenChange(false);
                        }}
                        role="menuitem"
                    >
                        <EditIcon className="w-4" />
                        Rename URL
                    </button>

                    <button
                        type="button"
                        className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-sm text-sm"
                        onClick={(e) => {
                            e.preventDefault();
                            onRenameTitle();
                            onOpenChange(false);
                        }}
                        role="menuitem"
                    >
                        <Settings className="w-4" />
                        Rename title
                    </button>

                    <button
                        type="button"
                        className="w-full flex items-center gap-2 text-left px-3 py-2 rounded-sm text-sm hover:bg-red-50 dark:hover:bg-red-900/30"
                        onClick={(e) => {
                            e.preventDefault();
                            onRemove();
                            onOpenChange(false);
                        }}
                        role="menuitem"
                    >
                        <XIcon className="w-4" />
                        Remove
                    </button>
                </div>
            ) : null}
        </div>
    );
};

export default ItemActionsMenu;