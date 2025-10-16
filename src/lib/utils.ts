import {
  DEFAULT_FAVICON_PATH,
  MAX_MAX_ITEMS,
  MIN_MAX_ITEMS,
} from './constants';

export function getRuntimeResourceUrl(path: string): string {
  try {
    if (typeof chrome !== 'undefined' && chrome.runtime?.getURL) {
      return chrome.runtime.getURL(path);
    }
  } catch {
    // no-op: fall back to plain path
  }
  return path;
}

export function getHost(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url ?? '';
  }
}

export function formatRelativeTime(epoch: number): string {
  const now = Date.now();
  const diff = now - epoch;
  if (!Number.isFinite(diff) || diff < 0) {
    return 'just now';
  }
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export function isValidVisitUrl(url: string | undefined | null): url is string {
  if (!url) return false;
  if (!url.startsWith('http')) return false;
  if (url.startsWith('chrome://') || url.startsWith('chrome-extension://')) {
    return false;
  }
  if (url === 'about:blank') return false;
  return true;
}

export function isSafeFavicon(candidate: unknown): candidate is string {
  return (
    typeof candidate === 'string' &&
    candidate.length > 0 &&
    !candidate.startsWith('chrome://')
  );
}

export function externalFaviconUrl(url: string): string {
  const host = getHost(url);
  if (!host) {
    return getRuntimeResourceUrl(DEFAULT_FAVICON_PATH);
  }
  const params = new URLSearchParams({ domain: host, sz: '64' });
  return `https://www.google.com/s2/favicons?${params.toString()}`;
}

export function hostFaviconUrl(url: string): string {
  const host = getHost(url);
  if (!host) {
    return getRuntimeResourceUrl(DEFAULT_FAVICON_PATH);
  }
  return `https://${host}/favicon.ico`;
}

export function resolveFavicon(url: string, candidate?: string | null): string {
  if (isSafeFavicon(candidate)) {
    return candidate;
  }
  return externalFaviconUrl(url);
}

export function clampMaxItems(candidate: number): number {
  if (!Number.isFinite(candidate)) {
    return Math.max(MIN_MAX_ITEMS, Math.min(MAX_MAX_ITEMS, MIN_MAX_ITEMS));
  }
  return Math.max(MIN_MAX_ITEMS, Math.min(MAX_MAX_ITEMS, Math.trunc(candidate)));
}
