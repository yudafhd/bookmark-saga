import { readMaxItems, readVisits, writeMaxItems, writeVisits } from '../src/lib/storage';
import { resolveFavicon, isValidVisitUrl } from '../src/lib/utils';
import type { VisitEntry } from '../src/lib/types';

function normalizeTitle(url: string, rawTitle?: string | null): string {
  const cleaned = (rawTitle ?? '').trim();
  if (cleaned.length > 0) {
    return cleaned;
  }
  try {
    return new URL(url).hostname || url;
  } catch {
    return url;
  }
}

async function persistVisit(entry: VisitEntry): Promise<void> {
  const [visits, maxItems] = await Promise.all([readVisits(), readMaxItems()]);
  const withoutDuplicate = visits.filter((item) => item.url !== entry.url);
  withoutDuplicate.unshift(entry);
  const trimmed = withoutDuplicate.slice(0, maxItems);
  await writeVisits(trimmed);
}

async function handleVisit(url: string, title?: string | null, favIconUrl?: string | null) {
  if (!isValidVisitUrl(url)) return;
  const entry: VisitEntry = {
    url,
    title: normalizeTitle(url, title),
    visitTime: Date.now(),
    faviconUrl: resolveFavicon(url, favIconUrl ?? undefined),
  };
  await persistVisit(entry);
}

async function ensureDefaults() {
  const [visits, maxItems] = await Promise.all([readVisits(), readMaxItems()]);
  if (!Array.isArray(visits)) {
    await writeVisits([]);
  }
  await writeMaxItems(maxItems);
}

export default defineBackground(() => {
  chrome.history.onVisited.addListener((historyItem) => {
    if (!historyItem.url) return;
    void handleVisit(historyItem.url, historyItem.title);
  });

  chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
    if (changeInfo.status !== 'complete') return;
    if (!tab.url || !tab.title) return;
    void handleVisit(tab.url, tab.title, tab.favIconUrl);
  });

  chrome.runtime.onInstalled.addListener(() => {
    void ensureDefaults();
  });
});
