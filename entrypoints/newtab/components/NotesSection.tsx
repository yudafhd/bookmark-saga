import React, { useState } from 'react';
import type { Note, NoteColor } from '@/lib/types';
import { MdAdd, MdDelete, MdEdit, MdMoreVert, MdColorLens, MdCheckBox, MdCheckBoxOutlineBlank } from 'react-icons/md';

interface NotesSectionProps {
    notes: Note[];
    categories: string[];
    onCreateNote: (content: string, color: NoteColor, category: string) => void;
    onUpdateNote: (id: string, content: string, color: NoteColor, category: string) => void;
    onDeleteNote: (id: string, category: string) => void;
    onDeleteNotes: (ids: string[]) => void;
}

const NOTE_COLORS: { value: NoteColor; label: string; bg: string; border: string }[] = [
    { value: 'white', label: 'White', bg: 'bg-white ', border: 'border-gray-400' },
    { value: 'yellow', label: 'Yellow', bg: 'bg-yellow-100', border: 'border-yellow-400' },
    { value: 'blue', label: 'Blue', bg: 'bg-blue-100', border: 'border-blue-400' },
    { value: 'green', label: 'Green', bg: 'bg-green-100', border: 'border-green-400' },
    { value: 'red', label: 'Red', bg: 'bg-red-100', border: 'border-red-400' },
];

const NotesSection: React.FC<NotesSectionProps> = ({
    notes,
    categories,
    onCreateNote,
    onUpdateNote,
    onDeleteNote,
    onDeleteNotes,
}) => {
    const [isCreating, setIsCreating] = useState(false);
    const [newNoteContent, setNewNoteContent] = useState('');
    const [newNoteColor, setNewNoteColor] = useState<NoteColor>('yellow');
    const [newNoteCategory, setNewNoteCategory] = useState('Unsorted');
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editColor, setEditColor] = useState<NoteColor>('yellow');
    const [editCategory, setEditCategory] = useState('Unsorted');
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedNoteIds, setSelectedNoteIds] = useState<Set<string>>(new Set());
    const [isSelectionMode, setIsSelectionMode] = useState(false);

    const getColorClasses = (color: NoteColor) => {
        const colorConfig = NOTE_COLORS.find(c => c.value === color);
        return colorConfig ? `${colorConfig.bg} ${colorConfig.border}` : NOTE_COLORS[0].bg + ' ' + NOTE_COLORS[0].border;
    };

    const handleCreateNote = () => {
        if (!newNoteContent.trim()) return;
        onCreateNote(newNoteContent, newNoteColor, newNoteCategory);
        setNewNoteContent('');
        setNewNoteColor('yellow');
        setNewNoteCategory('Unsorted');
        setIsCreating(false);
    };

    const handleUpdateNote = (note: Note) => {
        if (!editContent.trim()) return;
        onUpdateNote(note.id, editContent, editColor, editCategory);
        setEditingNoteId(null);
        setEditContent('');
    };

    const startEditing = (note: Note) => {
        setEditingNoteId(note.id);
        setEditContent(note.content);
        setEditColor(note.color);
        setEditCategory(note.category);
        setOpenMenuId(null);
    };

    const toggleNoteSelection = (id: string) => {
        const newSelection = new Set(selectedNoteIds);
        if (newSelection.has(id)) {
            newSelection.delete(id);
        } else {
            newSelection.add(id);
        }
        setSelectedNoteIds(newSelection);

        if (newSelection.size === 0 && isSelectionMode) {
            // Optional: Auto-exit selection mode if empty? 
            // Keeping it manual for now as it might be annoying
        }
    };

    const handleBulkDelete = () => {
        onDeleteNotes(Array.from(selectedNoteIds));
        setSelectedNoteIds(new Set());
        setIsSelectionMode(false);
    };

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedNoteIds(new Set());
    };

    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [tempCategoryName, setTempCategoryName] = useState('');

    const handleAddCategory = () => {
        if (!tempCategoryName.trim()) {
            setIsAddingCategory(false);
            return;
        }
        setNewNoteCategory(tempCategoryName.trim());
        setTempCategoryName('');
        setIsAddingCategory(false);
        setIsCreating(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleAddCategory();
        } else if (e.key === 'Escape') {
            setIsAddingCategory(false);
            setTempCategoryName('');
        }
    };

    const groupedNotes = React.useMemo(() => {
        const groups: Record<string, Note[]> = {};
        notes.forEach(note => {
            if (!groups[note.category]) {
                groups[note.category] = [];
            }
            groups[note.category].push(note);
        });
        return groups;
    }, [notes]);

    const displayCategories = selectedCategory
        ? [selectedCategory]
        : categories.sort((a, b) => {
            if (a === 'Unsorted') return -1;
            if (b === 'Unsorted') return 1;
            return a.localeCompare(b);
        });

    return (
        <section className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-semibold">Notes</h2>
                    <p className="text-sm opacity-70 mt-1">Simple notes with categories and colors</p>
                </div>
                <div className="flex gap-2">
                    {isSelectionMode ? (
                        <>
                            <button
                                type="button"
                                className="bs-btn bs-btn--neutral px-4 py-2 text-sm font-semibold"
                                onClick={toggleSelectionMode}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="bs-btn bg-red-600 text-white hover:bg-red-700 px-4 py-2 text-sm font-semibold"
                                onClick={handleBulkDelete}
                                disabled={selectedNoteIds.size === 0}
                            >
                                Delete ({selectedNoteIds.size})
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                type="button"
                                className="bs-btn bs-btn--neutral px-4 py-2 text-sm font-semibold"
                                onClick={toggleSelectionMode}
                                disabled={notes.length === 0}
                            >
                                Select
                            </button>
                            <button
                                type="button"
                                className="bs-btn bs-btn--primary flex items-center gap-2 px-4 py-2 text-sm font-semibold"
                                onClick={() => setIsCreating(true)}
                            >
                                <MdAdd size={18} />
                                New Note
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 items-center">
                <button
                    type="button"
                    className={`px-3 py-1 text-xs font-medium rounded-full transition ${!selectedCategory
                        ? 'bg-blue-600 text-white'
                        : 'bs-surface hover:opacity-80'
                        }`}
                    onClick={() => setSelectedCategory(null)}
                >
                    All
                </button>
                {categories.map(category => (
                    <button
                        key={category}
                        type="button"
                        className={`px-3 py-1 text-xs font-medium rounded-full transition ${selectedCategory === category
                            ? 'bg-blue-600 text-white'
                            : 'bs-surface hover:opacity-80'
                            }`}
                        onClick={() => setSelectedCategory(category)}
                    >
                        {category} ({groupedNotes[category]?.length || 0})
                    </button>
                ))}

                {isAddingCategory ? (
                    <div className="flex items-center">
                        <input
                            type="text"
                            value={tempCategoryName}
                            onChange={(e) => setTempCategoryName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onBlur={() => {
                                if (!tempCategoryName.trim()) setIsAddingCategory(false);
                            }}
                            className="px-3 py-1 text-xs font-medium rounded-full bs-surface border border-blue-500 outline-none min-w-[100px]"
                            placeholder="New Category..."
                            autoFocus
                        />
                    </div>
                ) : (
                    <button
                        type="button"
                        className="px-3 py-1 text-xs font-medium rounded-full bs-surface hover:opacity-80 border border-dashed border-current/30 flex items-center gap-1 opacity-60 hover:opacity-100 transition"
                        onClick={() => setIsAddingCategory(true)}
                        title="Add new category"
                    >
                        <MdAdd size={14} />
                        Add
                    </button>
                )}
            </div>

            {/* Create Note Modal */}
            {isCreating && (
                <div
                    className="fixed inset-0 z-50 bg-black/50 flex !mt-0 items-center justify-center px-4"
                    onClick={() => setIsCreating(false)}
                >
                    <div
                        className="bs-surface w-full max-w-lg space-y-4 rounded-lg border border-white/20 p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h3 className="text-lg font-semibold">Create New Note</h3>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium mb-2">Content</label>
                                <textarea
                                    value={newNoteContent}
                                    onChange={(e) => setNewNoteContent(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bs-surface border border-white/20 min-h-[120px] resize-y"
                                    placeholder="Write your note here..."
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Color</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {NOTE_COLORS.map(color => (
                                        <button
                                            key={color.value}
                                            type="button"
                                            className={`p-3 rounded-md border-2 transition ${newNoteColor === color.value
                                                ? 'ring-2 ring-blue-500 ring-offset-2'
                                                : ''
                                                } ${getColorClasses(color.value)}`}
                                            onClick={() => setNewNoteColor(color.value)}
                                            title={color.label}
                                        >
                                            <div className="h-4"></div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2">Category</label>
                                <input
                                    type="text"
                                    value={newNoteCategory}
                                    onChange={(e) => setNewNoteCategory(e.target.value)}
                                    className="w-full px-3 py-2 rounded-md bs-surface border border-white/20"
                                    placeholder="Category name"
                                />
                                {categories.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {categories.map(cat => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => setNewNoteCategory(cat)}
                                                className={`px-2 py-1 text-xs rounded-md border transition ${newNoteCategory === cat
                                                    ? 'bg-blue-100 border-blue-300 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200'
                                                    : 'bs-surface border-white/10 hover:border-white/30 opacity-70 hover:opacity-100'
                                                    }`}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3 justify-end">
                            <button
                                type="button"
                                className="bs-btn bs-btn--neutral px-4 py-2 text-sm font-semibold"
                                onClick={() => setIsCreating(false)}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="bs-btn bs-btn--primary px-4 py-2 text-sm font-semibold"
                                onClick={handleCreateNote}
                                disabled={!newNoteContent.trim()}
                            >
                                Create
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notes Grid */}
            <div className="space-y-6">
                {displayCategories.map(category => {
                    const categoryNotes = groupedNotes[category] || [];
                    if (categoryNotes.length === 0) return null;

                    return (
                        <div key={category} className="space-y-3">
                            <h3 className="text-lg font-semibold">{category}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {categoryNotes.map(note => (
                                    <div
                                        key={note.id}
                                        className={`p-4 rounded-lg border-2 shadow-md relative min-h-[150px] flex flex-col ${getColorClasses(note.color)}`}
                                        onClick={() => {
                                            if (isSelectionMode) {
                                                toggleNoteSelection(note.id);
                                            }
                                        }}
                                    >
                                        {isSelectionMode && (
                                            <div className="absolute top-2 right-2 z-10">
                                                {selectedNoteIds.has(note.id) ? (
                                                    <MdCheckBox size={24} className="text-blue-600" />
                                                ) : (
                                                    <MdCheckBoxOutlineBlank size={24} className="text-gray-500 opacity-50" />
                                                )}
                                            </div>
                                        )}

                                        {editingNoteId === note.id ? (
                                            <div className="space-y-3 flex-1 flex flex-col">
                                                <textarea
                                                    value={editContent}
                                                    onChange={(e) => setEditContent(e.target.value)}
                                                    className="flex-1 w-full px-2 py-2 rounded-md bg-white/50 text-black border border-white/30 resize-none text-sm"
                                                    autoFocus
                                                />
                                                <div className="space-y-2">
                                                    <div className="flex gap-1 flex-wrap">
                                                        {NOTE_COLORS.map(color => (
                                                            <button
                                                                key={color.value}
                                                                type="button"
                                                                className={`p-2 rounded border ${editColor === color.value ? 'ring-2 ring-blue-500' : ''
                                                                    } ${getColorClasses(color.value)}`}
                                                                onClick={() => setEditColor(color.value)}
                                                                title={color.label}
                                                            >
                                                                <div className="h-3 w-3"></div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <select
                                                        value={editCategory}
                                                        onChange={(e) => setEditCategory(e.target.value)}
                                                        className="w-full px-2 py-1 rounded-md bg-white/50 dark:bg-black/20 border border-white/30 text-xs text-black dark:text-white"
                                                    >
                                                        {categories.map(cat => (
                                                            <option key={cat} value={cat} className="text-black">
                                                                {cat}
                                                            </option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button
                                                        type="button"
                                                        className="flex-1 px-3 py-1 text-xs font-semibold rounded bg-blue-600 text-white hover:bg-blue-700"
                                                        onClick={() => handleUpdateNote(note)}
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="flex-1 px-3 py-1 text-xs font-semibold rounded bs-surface hover:opacity-80"
                                                        onClick={() => setEditingNoteId(null)}
                                                    >
                                                        Cancel
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex-1 text-black whitespace-pre-wrap text-sm break-words">
                                                    {note.content}
                                                </div>
                                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-current/20">
                                                    <span className="text-xs text-black opacity-60">
                                                        {(() => {
                                                            const diff = Date.now() - note.updatedAt;
                                                            const minutes = Math.floor(diff / 60000);
                                                            const hours = Math.floor(diff / 3600000);
                                                            const days = Math.floor(diff / 86400000);

                                                            if (minutes < 1) return 'Baru saja diedit';
                                                            if (minutes < 60) return `${minutes} menit lalu`;
                                                            if (hours < 24) return `${hours} jam lalu`;
                                                            return `${days} hari lalu`;
                                                        })()}
                                                    </span>
                                                    {!isSelectionMode && (
                                                        <div className="relative">
                                                            <button
                                                                type="button"
                                                                className="p-1 text-black rounded hover:bg-black/10 dark:hover:bg-white/10"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    setOpenMenuId(openMenuId === note.id ? null : note.id);
                                                                }}
                                                            >
                                                                <MdMoreVert size={18} />
                                                            </button>
                                                            {openMenuId === note.id && (
                                                                <div className="absolute right-0 bottom-full mb-1 w-32 rounded-md bs-surface border border-white/20 shadow-lg z-10">
                                                                    <button
                                                                        type="button"
                                                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-black/5 dark:hover:bg-white/5 rounded-t-md"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            startEditing(note);
                                                                        }}
                                                                    >
                                                                        <MdEdit size={14} />
                                                                        Edit
                                                                    </button>
                                                                    <button
                                                                        type="button"
                                                                        className="w-full flex items-center gap-2 px-3 py-2 text-xs hover:bg-black/5 dark:hover:bg-white/5 rounded-b-md text-red-600 dark:text-red-400"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onDeleteNote(note.id, note.category);
                                                                            setOpenMenuId(null);
                                                                        }}
                                                                    >
                                                                        <MdDelete size={14} />
                                                                        Delete
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>

            {notes.length === 0 && (
                <div className="text-center py-16">
                    <p className="text-lg font-semibold opacity-70">No notes yet</p>
                    <p className="text-sm opacity-50 mt-2">Click "New Note" to create your first note</p>
                </div>
            )}
        </section>
    );
};

export default NotesSection;