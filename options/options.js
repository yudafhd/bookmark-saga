const MAX_ITEMS_KEY = 'maxItems';

const form = document.getElementById('optionsForm');
const maxItemsEl = document.getElementById('maxItems');
const messageEl = document.getElementById('message');

async function loadOptions() {
    const res = await chrome.storage.local.get({ [MAX_ITEMS_KEY]: 20 });
    maxItemsEl.value = Math.max(5, Math.min(200, res[MAX_ITEMS_KEY] || 20));
}

async function saveOptions(e) {
    e.preventDefault();
    const value = parseInt(maxItemsEl.value, 10);
    if (isNaN(value) || value < 5 || value > 200) {
        alert('Please enter a number between 5 and 200.');
        return;
    }
    await chrome.storage.local.set({ [MAX_ITEMS_KEY]: value });
    messageEl.hidden = false;
    setTimeout(() => messageEl.hidden = true, 2000);
}

form.addEventListener('submit', saveOptions);
document.addEventListener('DOMContentLoaded', loadOptions);