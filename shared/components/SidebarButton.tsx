import React from 'react';
import { FolderClosed } from '@/shared/icons';

export interface SidebarButtonProps {
    label: string;
    depth: number;
    count: number;
    active: boolean;
    onClick: () => void;
    onOpenAll?: () => void;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ label, depth, count, active, onClick, onOpenAll }) => {
    const paddingLeft = `${Math.max(0, depth - 1) * 16 + 12}px`;
    const disableOpenAll = !onOpenAll || count === 0;

    return (
        <div className="flex w-full items-center gap-2 pr-2" style={{ paddingLeft }}>
            <button
                type="button"
                onClick={onClick}
                className={[
                    'flex-1 flex items-center justify-between gap-2 rounded-sm px-3 py-2 text-left transition',
                    active ? 'font-bold' : '',
                ].join(' ')}
                aria-current={active ? 'page' : undefined}
            >
                <span className="flex items-center gap-2 min-w-0">
                    <FolderClosed className="w-4" />
                    <span className="truncate">{label}</span>
                </span>
                <span className="text-xs">{count}</span>
            </button>
        </div>
    );
};

export default SidebarButton;
