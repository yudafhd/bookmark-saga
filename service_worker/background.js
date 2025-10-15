const VISITS_KEY = 'lastVisits';
const MAX_ITEMS_KEY = 'maxItems';

async function getSettings() {
    const res = await chrome.storage.local.get({ [MAX_ITEMS_KEY]: 20 });
    return { maxItems: Math.max(5, Math.min(200, res[MAX_ITEMS_KEY] || 20)) };
}

async function getVisits() {
    const res = await chrome.storage.local.get({ [VISITS_KEY]: [] });
    return Array.isArray(res[VISITS_KEY]) ? res[VISITS_KEY] : [];
}

async function setVisits(visits) {
    await chrome.storage.local.set({ [VISITS_KEY]: visits });
}

function isValidUrl(url) {
    return url && url.startsWith('http') && !url.includes('chrome://') && !url.includes('chrome-extension://') && url !== 'about:blank';
}

function addVisit({ url, title, favIconUrl }) {
    if (!isValidUrl(url)) return;
    const visitTime = Date.now();
    const faviconUrl = favIconUrl || `chrome://favicon/size/32@2x/${url}`;
    const host = getHost(url);
    const finalTitle = (title || '').trim() || host || url;
    return { url, title: finalTitle, visitTime, faviconUrl };
}

function getHost(u) {
    try {
        return new URL(u).hostname;
    } catch {
        return u || '';
    }
}

async function handleVisit(url, title) {
    const item = addVisit({ url, title });
    if (!item) return;

    const visits = await getVisits();
    const { maxItems } = await getSettings();

    // De-dupe by URL, move to front if exists
    const filtered = visits.filter(v => v.url !== item.url);
    filtered.unshift(item);

    // Trim to maxItems
    const trimmed = filtered.slice(0, maxItems);
    await setVisits(trimmed);
}

chrome.history.onVisited.addListener((historyItem) => {
    if (historyItem.url && historyItem.title !== undefined) {
        handleVisit(historyItem.url, historyItem.title);
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.title) {
        handleVisit(tab.url, tab.title, tab.favIconUrl);
    }
});

chrome.runtime.onInstalled.addListener(async () => {
    const visits = await getVisits();
    if (!Array.isArray(visits)) {
        await setVisits([]);
    }
    const settings = await getSettings();
    if (!settings.maxItems) {
        await chrome.storage.local.set({ [MAX_ITEMS_KEY]: 20 });
    }
});