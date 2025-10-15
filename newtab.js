const VISITS_KEY = 'lastVisits';
const MAX_ITEMS_KEY = 'maxItems';
const FOLDERS_KEY = 'folders';
const SAVED_KEY = 'saved';

const gridEl = document.getElementById('grid');
const emptyEl = document.getElementById('empty');
const searchEl = document.getElementById('search');
const refreshBtn = document.getElementById('refresh');
const clearBtn = document.getElementById('clear');
const saveToFolderBtn = document.getElementById('saveToFolder');
const openModalBtn = document.getElementById('openModal');

// Modal elements
const modal = document.getElementById('modal');
const cancelModalBtn = document.getElementById('cancelModal');
const confirmModalBtn = document.getElementById('confirmModal');

// Folder modal elements
const folderModal = document.getElementById('folderModal');
const folderTreeEl = document.getElementById('folderTree');
const newFolderNameEl = document.getElementById('newFolderName');
const createFolderBtn = document.getElementById('createFolder');
const cancelFolderModalBtn = document.getElementById('cancelFolderModal');
const saveToFolderBtnModal = document.getElementById('saveToFolderBtn');

let allVisits = [];
let filteredVisits = [];
let folders = [];
let selectedFolderId = 'general';
let currentPageToSave = null;

function escapeHtml(str) {
    return String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/`/g, "&#96;");
}

function getHost(u) {
    try {
        return new URL(u).hostname;
    } catch {
        return u || "";
    }
}

function formatRelativeTime(epoch) {
    const now = Date.now();
    const diff = now - epoch;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "baru saja";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
}

function getFaviconUrl(url, storedFavicon) {
    // Prioritas: chrome://favicon dulu
    return storedFavicon || `chrome://favicon/size/32@2x/${url}`;
}

function getFallbackFaviconUrl(url) {
    const host = getHost(url);
    // Google S2 sebagai fallback
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=32`;
}

function getRootFaviconUrl(url) {
    const host = getHost(url);
    return `https://${host}/favicon.ico`;
}

async function readVisits() {
    const res = await chrome.storage.local.get({ [VISITS_KEY]: [] });
    return Array.isArray(res[VISITS_KEY]) ? res[VISITS_KEY] : [];
}

async function readMaxItems() {
    const res = await chrome.storage.local.get({ [MAX_ITEMS_KEY]: 20 });
    return Math.max(5, Math.min(200, res[MAX_ITEMS_KEY] || 20));
}

async function readFolders() {
    const res = await chrome.storage.local.get({ [FOLDERS_KEY]: [{ id: 'general', name: 'General', parentId: null }] });
    return Array.isArray(res[FOLDERS_KEY]) ? res[FOLDERS_KEY] : [{ id: 'general', name: 'General', parentId: null }];
}

async function writeFolders(folders) {
    await chrome.storage.local.set({ [FOLDERS_KEY]: folders });
}

async function readSaved() {
    const res = await chrome.storage.local.get({ [SAVED_KEY]: {} });
    return res[SAVED_KEY] || {};
}

async function writeSaved(saved) {
    await chrome.storage.local.set({ [SAVED_KEY]: saved });
}

function render() {
    gridEl.textContent = '';
    const hasItems = filteredVisits.length > 0;
    emptyEl.hidden = hasItems;
    gridEl.hidden = !hasItems;

    if (!hasItems) return;

    for (const item of filteredVisits) {
        const card = document.createElement('article');
        card.className = 'rounded-xl border border-black/5 dark:border-white/10 bg-white/60 dark:bg-gray-800/60 backdrop-blur shadow hover:shadow-md transition cursor-pointer p-4';
        card.tabIndex = 0;
        card.setAttribute('role', 'link');
        card.setAttribute('aria-label', `Kunjungi ${item.title} di ${item.url}`);

        const favicon = document.createElement('img');
        favicon.src = getFaviconUrl(item.url, item.faviconUrl);
        favicon.alt = '';
        favicon.className = 'w-8 h-8 rounded mb-2';
        favicon.addEventListener('error', function () {
            // Fallback ke Google S2
            this.src = getFallbackFaviconUrl(item.url);
            this.addEventListener('error', function () {
                // Fallback ke root favicon.ico
                this.src = getRootFaviconUrl(item.url);
                this.addEventListener('error', function () {
                    // Final fallback ke emoji
                    this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiByeD0iNCIgZmlsbD0iI2Y5ZmFmYiIvPgo8dGV4dCB4PSIxNiIgeT0iMjAiIGZvbnQtc2l6ZT0iMTIiIGZpbGw9IiM5Y2E0YWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuMzVlbSI+8J+RjwvdGV4dD4KPHN2Zz4=';
                });
            });
        });

        const host = document.createElement('p');
        host.className = 'text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1';
        host.textContent = getHost(item.url);

        const title = document.createElement('h3');
        title.className = 'text-base font-medium text-gray-900 dark:text-gray-100 mb-1 line-clamp-2';
        title.title = item.title;
        title.textContent = item.title;

        const url = document.createElement('p');
        url.className = 'text-sm text-gray-500 dark:text-gray-400 truncate mb-2';
        url.title = item.url;
        url.textContent = item.url;

        const time = document.createElement('span');
        time.className = 'inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded';
        time.textContent = formatRelativeTime(item.visitTime);

        card.appendChild(favicon);
        card.appendChild(host);
        card.appendChild(title);
        card.appendChild(url);
        card.appendChild(time);

        card.addEventListener('click', () => openUrl(item.url));
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openUrl(item.url);
            }
        });

        gridEl.appendChild(card);
    }
}

function openUrl(url) {
    try {
        chrome.tabs.update({ url });
    } catch {
        window.location.href = url;
    }
}

function filterVisits() {
    const query = searchEl.value.toLowerCase().trim();
    if (!query) {
        filteredVisits = allVisits;
    } else {
        filteredVisits = allVisits.filter(item =>
            item.title.toLowerCase().includes(query) ||
            item.url.toLowerCase().includes(query) ||
            getHost(item.url).toLowerCase().includes(query)
        );
    }
    render();
}

async function loadAndRender() {
    allVisits = await readVisits();
    filterVisits();
}

async function clearVisits() {
    await chrome.storage.local.set({ [VISITS_KEY]: [] });
    allVisits = [];
    filterVisits();
}

// Modal functions
function openModal() {
    modal.classList.remove('hidden');
    modal.focus();
}

function closeModal() {
    modal.classList.add('hidden');
}

// Folder modal functions
function openFolderModal(page) {
    currentPageToSave = page;
    renderFolderTree();
    folderModal.classList.remove('hidden');
    folderModal.focus();
}

function closeFolderModal() {
    folderModal.classList.add('hidden');
    currentPageToSave = null;
}

function renderFolderTree() {
    folderTreeEl.innerHTML = '';
    folders.forEach(folder => {
        const folderEl = document.createElement('div');
        folderEl.className = 'flex items-center gap-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer';
        folderEl.dataset.id = folder.id;

        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'folder';
        radio.value = folder.id;
        radio.checked = folder.id === selectedFolderId;

        const label = document.createElement('label');
        label.textContent = folder.name;
        label.className = 'cursor-pointer flex-1';

        const actions = document.createElement('div');
        actions.className = 'flex gap-1';

        const editBtn = document.createElement('button');
        editBtn.textContent = 'Edit';
        editBtn.className = 'text-blue-600 hover:text-blue-800 text-sm';
        editBtn.onclick = () => editFolder(folder.id);

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Delete';
        deleteBtn.className = 'text-red-600 hover:text-red-800 text-sm';
        deleteBtn.onclick = () => deleteFolder(folder.id);

        if (folder.id !== 'general') {
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);
        }

        folderEl.appendChild(radio);
        folderEl.appendChild(label);
        folderEl.appendChild(actions);
        folderTreeEl.appendChild(folderEl);
    });
}

async function createFolder(name) {
    if (!name.trim()) return;
    const newFolder = {
        id: Date.now().toString(),
        name: name.trim(),
        parentId: null
    };
    folders.push(newFolder);
    await writeFolders(folders);
    renderFolderTree();
}

async function editFolder(id) {
    const folder = folders.find(f => f.id === id);
    if (!folder) return;
    const newName = prompt('Edit folder name:', folder.name);
    if (newName && newName.trim()) {
        folder.name = newName.trim();
        await writeFolders(folders);
        renderFolderTree();
    }
}

async function deleteFolder(id) {
    if (id === 'general') return;
    if (!confirm('Delete this folder and all its contents?')) return;
    folders = folders.filter(f => f.id !== id);
    const saved = await readSaved();
    delete saved[id];
    await writeFolders(folders);
    await writeSaved(saved);
    if (selectedFolderId === id) selectedFolderId = 'general';
    renderFolderTree();
}

async function saveToFolder() {
    if (!currentPageToSave) return;
    const saved = await readSaved();
    if (!saved[selectedFolderId]) saved[selectedFolderId] = [];
    const exists = saved[selectedFolderId].some(item => item.url === currentPageToSave.url);
    if (!exists) {
        saved[selectedFolderId].push({
            ...currentPageToSave,
            savedAt: Date.now()
        });
        await writeSaved(saved);
    }
    closeFolderModal();
}

async function getCurrentPage() {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]) {
        return {
            url: tabs[0].url,
            title: tabs[0].title,
            faviconUrl: tabs[0].favIconUrl
        };
    }
    return null;
}

// Event listeners
searchEl.addEventListener('input', filterVisits);
refreshBtn.addEventListener('click', loadAndRender);
clearBtn.addEventListener('click', clearVisits);
saveToFolderBtn.addEventListener('click', async () => {
    const page = await getCurrentPage();
    if (page) openFolderModal(page);
});
openModalBtn.addEventListener('click', openModal);

// Modal events
cancelModalBtn.addEventListener('click', closeModal);
confirmModalBtn.addEventListener('click', closeModal);
modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
});
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (!modal.classList.contains('hidden')) closeModal();
        if (!folderModal.classList.contains('hidden')) closeFolderModal();
    }
});

// Folder modal events
cancelFolderModalBtn.addEventListener('click', closeFolderModal);
// saveToFolderBtnModal.addEventListener('click', saveToFolder);
createFolderBtn.addEventListener('click', () => {
    const name = newFolderNameEl.value.trim();
    if (name) {
        createFolder(name);
        newFolderNameEl.value = '';
    }
});
folderModal.addEventListener('click', (e) => {
    if (e.target === folderModal) closeFolderModal();
});
folderTreeEl.addEventListener('change', (e) => {
    if (e.target.type === 'radio') {
        selectedFolderId = e.target.value;
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    folders = await readFolders();
    await loadAndRender();
});