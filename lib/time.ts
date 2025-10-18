const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = 60 * MS_PER_SECOND;
const MS_PER_HOUR = 60 * MS_PER_MINUTE;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const MS_PER_WEEK = 7 * MS_PER_DAY;
const MS_PER_MONTH = 30 * MS_PER_DAY;   // ≈ 30 days
const MS_PER_YEAR = 365 * MS_PER_DAY;  // ≈ 365 days

type TimeAgoStyle = "short" | "long";

function normalizeEpoch(epoch: number): number {
    // If it's likely seconds (e.g., 10 or 11 digits), convert to ms.
    return epoch < 1e12 ? epoch * 1000 : epoch;
}

function plural(n: number, unit: string, style: TimeAgoStyle): string {
    if (style === "short") {
        const map: Record<string, string> = {
            second: "s",
            minute: "m",
            hour: "h",
            day: "d",
            week: "w",
            month: "mo",
            year: "y",
        };
        return `${n}${map[unit]}`;
    }

    const resultText = n === 1 ? unit : `${unit}s`;
    return `${n} ${resultText}`;
}

/**
 * timeAgo: convert an epoch (ms or seconds) into a human-friendly relative string.
 * Examples (short): "just now", "45s ago", "12m ago", "3h ago", "5d ago", "2w ago", "7mo ago", "3y ago"
 * Examples (long):  "just now", "45 seconds ago", "12 minutes ago", "3 hours ago", ...
 */
export function timeAgo(epoch: number, style: TimeAgoStyle = "short"): string {
    const ts = normalizeEpoch(epoch);
    const now = Date.now();
    const diff = now - ts;

    if (!Number.isFinite(diff)) return style === "short" ? "just now" : "just now";
    if (diff < MS_PER_SECOND) return style === "short" ? "just now" : "just now";

    const seconds = Math.floor(diff / MS_PER_SECOND);
    if (seconds < 60) return `${plural(seconds, "second", style)} ago`;

    const minutes = Math.floor(diff / MS_PER_MINUTE);
    if (minutes < 60) return `${plural(minutes, "minute", style)} ago`;

    const hours = Math.floor(diff / MS_PER_HOUR);
    if (hours < 24) return `${plural(hours, "hour", style)} ago`;

    const days = Math.floor(diff / MS_PER_DAY);
    if (days < 7) return `${plural(days, "day", style)} ago`;

    const weeks = Math.floor(diff / MS_PER_WEEK);
    if (weeks < 5) return `${plural(weeks, "week", style)} ago`;

    const months = Math.floor(diff / MS_PER_MONTH);
    if (months < 12) return `${plural(months, "month", style)} ago`;

    const years = Math.floor(diff / MS_PER_YEAR);
    return `${plural(years, "year", style)} ago`;
}

// Optional alias if you prefer a more descriptive name:
export const formatRelativeTime = timeAgo;
