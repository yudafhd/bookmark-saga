import React from 'react';
import { MdAdd, MdClose } from 'react-icons/md';

interface FolderModalProps {
    open: boolean;
    title: string;
    foldersEmpty: boolean;
    folderTree: React.ReactNode;
    newName: string;
    onChangeNewName: (value: string) => void;
    onCreateFolder: (name: string, parentId?: string | null) => void;
    onClose: () => void;
    onSave: () => void;
}

const FolderModal: React.FC<FolderModalProps> = ({
    open,
    title,
    foldersEmpty,
    folderTree,
    newName,
    onChangeNewName,
    onCreateFolder,
    onClose,
    onSave,
}) => {
    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 flex !mt-0 items-center justify-center px-4"
            role="dialog"
            aria-modal="true"
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="bs-surface max-w-md w-full p-6 rounded-2xl border border-white/30 space-y-7">
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold">{title}</h2>
                        <p className="text-sm opacity-70">Choose a destination folder or create a new one.</p>
                    </div>
                    <button type="button" className="bs-btn bs-btn--neutral text-sm px-3 py-1.5" onClick={onClose}>
                        <MdClose size={16} />
                    </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1">
                    {foldersEmpty ? <p className="text-sm text-gray-500">No folders yet.</p> : folderTree}
                </div>

                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newName}
                        onChange={(e) => onChangeNewName(e.target.value)}
                        placeholder="New folder name"
                        className="flex-1 px-3 py-2 rounded border border-transparent bg-white/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                    />
                    <button
                        type="button"
                        className="bs-btn bs-btn--success px-4 py-2"
                        onClick={() => {
                            if (!newName.trim()) return;
                            onCreateFolder(newName.trim());
                        }}
                    >
                        <MdAdd size={18} />
                    </button>
                </div>

                <div className="flex justify-end gap-2">
                    <button
                        type="button"
                        className="bs-btn bs-btn--danger px-4 py-2 text-sm font-medium"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button type="button" className="bs-btn bs-btn--primary px-4 py-2" onClick={onSave}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FolderModal;
