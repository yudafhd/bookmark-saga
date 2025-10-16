import React from 'react';
import { FolderClosed } from '@/shared/icons';

export interface SidebarButtonProps {
    label: string;
    depth: number;
    count: number;
    active: boolean;
    onClick: () => void;
}

const SidebarButton: React.FC<SidebarButtonProps> = ({ label, depth, count, active, onClick }) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                'w-full flex items-center justify-between gap-2 px-3 py-2 transition',
                active ? 'font-bold' : '',
            ].join(' ')}
            style={{ paddingLeft: `${Math.max(0, depth - 1) * 16 + 12}px` }}
            aria-current={active ? 'page' : undefined}
        >
            <div className="flex gap-2">
                <FolderClosed className="w-4" />
                <span className="truncate">{label}</span>
            </div>
            <span className="text-xs">{count}</span>
        </button>
    );
};

export default SidebarButton;