import React, { useMemo, useState, useCallback } from 'react';
import type { VisitEntry } from '@/lib/types';
import { getHostName } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/time';
import { MdSearch, MdStarBorder } from 'react-icons/md';
interface HistorySectionProps {
    loading: boolean;
    visits: VisitEntry[];
    filteredVisits: VisitEntry[];
    hasVisits: boolean;
    savedUrlSet: Set<string>;
    onSaveClick: (visit: VisitEntry) => void;
}

const HistorySection: React.FC<HistorySectionProps> = ({
    loading,
    visits,
    filteredVisits,
    hasVisits,
    savedUrlSet,
    onSaveClick,
}) => {
    const [query, setQuery] = useState('');
    const [historyQuery, setHistoryQuery] = useState('');

    const googleLogoUrl = useMemo(() => {
        try {
            return new URL('../../assets/google_logo.svg', import.meta.url).toString();
        } catch {
            const g: any = globalThis as any;
            if (g?.chrome?.runtime?.getURL) {
                try {
                    return g.chrome.runtime.getURL('assets/google_logo.svg');
                } catch {
                    // ignore
                }
            }
            return '/assets/google_logo.svg';
        }
    }, []);

    const baseSorted = useMemo(() => {
        const q = historyQuery.trim().toLowerCase();
        const src = visits;
        const filtered = q
            ? src.filter((item) => {
                const title = item.title?.toLowerCase() ?? '';
                const url = item.url.toLowerCase();
                const host = getHostName(item.url).toLowerCase();
                return title.includes(q) || url.includes(q) || host.includes(q);
            })
            : src;
        const sorted = [...filtered].sort((a, b) => b.visitTime - a.visitTime);
        const limit = q ? 10 : 5;
        return sorted.slice(0, limit);
    }, [visits, historyQuery]);

    const groupedHero = useMemo(() => {
        if (baseSorted.length === 0) return [] as Array<{ label: string; items: VisitEntry[] }>;
        const now = new Date();
        const startOfDay = (d: Date) => {
            const x = new Date(d);
            x.setHours(0, 0, 0, 0);
            return x;
        };
        const nowStart = startOfDay(now).getTime();
        const dayGroups = new Map<number, VisitEntry[]>();
        const dateFormatter = new Intl.DateTimeFormat(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
        });
        for (const v of baseSorted) {
            const dayKey = startOfDay(new Date(v.visitTime)).getTime();
            if (!dayGroups.has(dayKey)) dayGroups.set(dayKey, []);
            dayGroups.get(dayKey)!.push(v);
        }
        return Array.from(dayGroups.entries())
            .sort(([a], [b]) => b - a)
            .map(([dayKey, items]) => {
                const daysDiff = Math.round((nowStart - dayKey) / (1000 * 60 * 60 * 24));
                let label = '';
                if (daysDiff === 0) label = 'Today';
                else if (daysDiff === 1) label = 'Yesterday';
                else label = dateFormatter.format(new Date(dayKey));
                return { label, items };
            });
    }, [baseSorted]);

    const heroTimeFormatter = useMemo(
        () => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }),
        [],
    );

    function openUrl(url: string) {
        window.open(url, '_self', 'noopener,noreferrer');
    }

    function toUrlOrGoogle(qs: string): string {
        const q = qs.trim();
        if (!q) return '';
        try {
            const u = new URL(q);
            return u.toString();
        } catch {
            // not absolute
        }
        const hasSpace = /\s/.test(q);
        const hasDot = q.includes('.');
        if (!hasSpace && hasDot) {
            return `https://${q}`;
        }
        return `https://www.google.com/search?q=${encodeURIComponent(q)}`;
    }

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            const target = toUrlOrGoogle(query);
            if (!target) return;
            openUrl(target);
        },
        [query],
    );

    const trimmedHistoryQuery = historyQuery.trim();
    const showCard = baseSorted.length > 0 || trimmedHistoryQuery.length > 0;
    const { summary, groupedVisits } = useMemo(() => {
        if (filteredVisits.length === 0) {
            return {
                summary: {
                    total: 0,
                    uniqueSites: 0,
                    latestVisit: null as number | null,
                },
                groupedVisits: [] as Array<{ label: string; items: VisitEntry[] }>,
            };
        }

        const sorted = [...filteredVisits].sort((a, b) => b.visitTime - a.visitTime);
        const hosts = new Set<string>();
        const now = new Date();

        const startOfDay = (date: Date) => {
            const normalizeHours = new Date(date);
            normalizeHours.setHours(0, 0, 0, 0);
            return normalizeHours;
        };
        const nowStartOfDay = startOfDay(now).getTime();
        const dayGroups = new Map<number, VisitEntry[]>();

        // date utils for format date
        const dateFormatter = new Intl.DateTimeFormat(undefined, {
            weekday: 'long',
            month: 'short',
            day: 'numeric',
        });

        for (const visit of sorted) {
            hosts.add(getHostName(visit.url));
            const visitDate = new Date(visit.visitTime);
            const visitDay = startOfDay(visitDate).getTime();
            if (!dayGroups.has(visitDay)) {
                dayGroups.set(visitDay, []);
            }
            dayGroups.get(visitDay)!.push(visit);
        }

        const groupedVisits = Array.from(dayGroups.entries())
            .sort(([a], [b]) => b - a)
            .map(([dayKey, items]) => {
                const daysDifference = Math.round((nowStartOfDay - dayKey) / (1000 * 60 * 60 * 24));
                let label: string;
                if (daysDifference === 0) {
                    label = 'Today';
                } else if (daysDifference === 1) {
                    label = 'Yesterday';
                } else {
                    label = dateFormatter.format(new Date(dayKey));
                }
                return { label, items };
            });

        return {
            summary: {
                total: sorted.length,
                uniqueSites: hosts.size,
                latestVisit: sorted[0]?.visitTime ?? null,
            },
            groupedVisits,
        };
    }, [filteredVisits]);


    if (loading) {
        return (
            <section className="space-y-8" aria-busy="true">
                <header className="grid gap-3 sm:grid-cols-3">
                    {Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="bs-card p-4 animate-pulse space-y-2">
                            <div className="h-3 w-24 rounded bg-gray-200/70 dark:bg-gray-700/70" />
                            <div className="h-6 w-16 rounded bg-gray-200/70 dark:bg-gray-700/70" />
                        </div>
                    ))}
                </header>
                <div className="rounded-lg border border-gray-200/70 shadow-sm dark:border-gray-700/60">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="flex items-center gap-4 px-4 py-4 sm:px-6 animate-pulse">
                            <div className="h-10 w-10 rounded bg-gray-200/70 dark:bg-gray-700/70" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-3/5 rounded bg-gray-200/70 dark:bg-gray-700/70" />
                                <div className="h-3 w-1/2 rounded bg-gray-200/50 dark:bg-gray-700/50" />
                            </div>
                            <div className="h-7 w-20 rounded bg-gray-200/70 dark:bg-gray-700/70" />
                        </div>
                    ))}
                </div>
            </section>
        );
    }

    return (
        <div className="space-y-8">
            {/* Hero */}
            <div className="w-full flex flex-col items-center gap-8">
                <div className="relative mt-2 mb-1 select-none">
                    <img
                        src={googleLogoUrl}
                        alt="Google"
                        className="h-16 sm:h-20 md:h-24"
                        draggable={false}
                    />
                    <p className='absolute bottom-[-2px] right-[-30px] opacity-30'>bookmark saga</p>
                </div>
                <form onSubmit={handleSubmit} className="w-full flex justify-center">
                    <div className="relative w-full max-w-3xl">
                        <MdSearch size={20} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 opacity-70" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search Google or type a URL"
                            className="bs-input bs-input--rounded  !w-full pl-10 pr-4 py-3 !pl-10 text-sm"
                            aria-label="Search Google or type a URL"
                        />

                    </div>
                </form>
                {filteredVisits.length === 0 && hasVisits ? (
                    <section className="space-y-6">
                        <div className="rounded-lg p-10 text-center shadow-sm dark:border-gray-600">
                            <p className="text-sm font-semibold">No history items match your search</p>
                            <p className="mt-1 text-xs opacity-70">
                                Try different keywords or clear the filter to see recent items.
                            </p>
                            <div className="mt-3">
                                <button
                                    type="button"
                                    className="bs-btn bs-btn--neutral px-3 py-1.5 text-xs font-semibold"
                                    onClick={() => setHistoryQuery('')}
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </section>
                ) : null}

                {!hasVisits &&
                    <section className="space-y-6">
                        <div className="p-10 text-center">
                            <p className="text-sm font-semibold">No visits captured yet</p>
                        </div>
                    </section>
                }
                {showCard ? (
                    <div className="w-full max-w-4xl rounded-2xl border border-gray-200/70 shadow-sm dark:border-gray-700/60">
                        <div className="rounded-t-2xl bg-gray-100/60 p-4 dark:bg-gray-700/40 flex items-center justify-between gap-3">
                            <div className="text-sm font-medium opacity-80">Continue with these tabs</div>
                            <input
                                type="search"
                                value={historyQuery}
                                onChange={(e) => setHistoryQuery(e.target.value)}
                                placeholder="Search visit history…"
                                className="bs-input bs-input--rounded w-48 text-xs"
                                aria-label="Search visit history"
                            />
                        </div>
                        {groupedHero.length === 0 ? (
                            <div className="px-4 py-10 text-center">
                                <p className="text-sm font-semibold">No visits match your search</p>
                                <p className="mt-1 text-xs opacity-70">
                                    Try different keywords or clear the filter to see recent items.
                                </p>
                                <div className="mt-3">
                                    <button
                                        type="button"
                                        className="bs-btn bs-btn--neutral px-3 py-1.5 text-xs font-semibold"
                                        onClick={() => setHistoryQuery('')}
                                    >
                                        Clear
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200/60 dark:divide-gray-700/50">
                                {groupedHero.map((group) => (
                                    <div key={group.label} className="py-1">
                                        <div className="px-4 py-2 text-[11px] uppercase tracking-wide opacity-60">{group.label}</div>
                                        {group.items.map((visit) => {
                                            const host = getHostName(visit.url);
                                            const visitDate = new Date(visit.visitTime);
                                            const key = `${visit.url}-${visit.visitTime}`;
                                            const isSaved = savedUrlSet.has(visit.url);
                                            return (
                                                <a
                                                    key={key}
                                                    href={visit.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-start gap-3 px-4 py-3"
                                                >
                                                    <div className="h-9 w-9 flex items-center justify-center rounded-md overflow-hidden">
                                                        {visit.faviconUrl ? (
                                                            <img src={visit.faviconUrl} alt="" className="h-5 w-5" loading="lazy" />
                                                        ) : (
                                                            <span className="text-xs opacity-70">{host[0]?.toUpperCase()}</span>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <div className="truncate text-sm font-semibold">
                                                            {visit.title || host}
                                                        </div>
                                                        <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs opacity-70">
                                                            <span className="truncate">{host}</span>
                                                            <span>•</span>
                                                            <span>You visited {formatRelativeTime(visit.visitTime)}</span>
                                                            <span>•</span>
                                                            <span>{heroTimeFormatter.format(visitDate)}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <button
                                                            type="button"
                                                            className={`p-1 text-xs font-semibold flex items-center gap-2`}
                                                            onClick={(ev) => {
                                                                ev.preventDefault();
                                                                onSaveClick(visit);
                                                            }}
                                                            aria-pressed={isSaved}
                                                        >
                                                            {!isSaved ? <MdStarBorder size={16} /> : 'Saved'}
                                                        </button>
                                                    </div>
                                                </a>
                                            );
                                        })}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default HistorySection;
