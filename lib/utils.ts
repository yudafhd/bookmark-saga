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
  } catch { }
  return path;
}

export function getHostName(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url ?? '';
  }
}

export function isValidVisitUrl(url: string | undefined | null): url is string {
  // Must be a non-empty string
  if (typeof url !== "string") return false;
  let normalizeUrl = url.trim();
  if (!normalizeUrl) return false;

  // Reject internal/browser pages and blank docs
  if (
    normalizeUrl === "about:blank" ||
    normalizeUrl === "about:srcdoc" ||
    normalizeUrl.startsWith("chrome://") ||
    normalizeUrl.startsWith("chrome-extension://") ||
    normalizeUrl.startsWith("edge://") ||
    normalizeUrl.startsWith("brave://") ||
    normalizeUrl.startsWith("vivaldi://") ||
    normalizeUrl.startsWith("opera://")
  ) {
    return false;
  }

  // Structural validation
  try {
    const url = new URL(normalizeUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") return false;
    if (!url.hostname) return false;
    return true;
  } catch {
    return false; // Malformed URL
  }
}


export function isSafeFavicon(candidate: unknown): candidate is string {
  return (
    typeof candidate === 'string' &&
    candidate.length > 0 &&
    !candidate.startsWith('chrome://')
  );
}

export function externalFaviconUrl(url: string): string {
  const host = getHostName(url);
  if (!host) {
    return getRuntimeResourceUrl(DEFAULT_FAVICON_PATH);
  }
  const params = new URLSearchParams({ domain: host, sz: '64' });
  return `https://www.google.com/s2/favicons?${params.toString()}`;
}

export function hostFaviconUrl(url: string): string {
  const host = getHostName(url);
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

// for performance, keep max history listed in 50-200 item
export function clampMaxItems(candidate: number): number {
  if (!Number.isFinite(candidate)) {
    return Math.max(MIN_MAX_ITEMS, Math.min(MAX_MAX_ITEMS, MIN_MAX_ITEMS));
  }
  return Math.max(MIN_MAX_ITEMS, Math.min(MAX_MAX_ITEMS, Math.trunc(candidate)));
}
