import React, { useMemo } from 'react';
import type { VisitEntry } from '@/lib/types';
import { formatRelativeTime } from '@/lib/time';
import { MdStar } from 'react-icons/md';
import { getHostName } from '@/lib/utils';
interface HistorySectionProps {
    loading: boolean;
    filteredVisits: VisitEntry[];
    hasVisits: boolean;
    savedUrlSet: Set<string>;
    onSaveClick: (visit: VisitEntry) => void;
}

const HistorySection: React.FC<HistorySectionProps> = ({
    loading,
    filteredVisits,
    hasVisits,
    savedUrlSet,
    onSaveClick,
}) => {
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

    const timeFormatter = useMemo(
        () =>
            new Intl.DateTimeFormat(undefined, {
                hour: 'numeric',
                minute: '2-digit',
            }),
        [],
    );

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

    if (!hasVisits) {
        return (
            <section className="space-y-6">
                <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center shadow-sm dark:border-gray-600">
                    <p className="text-lg font-semibold">No visits captured yet</p>
                    <p className="mt-2 text-sm opacity-70">
                        Keep browsing and your recent pages will automatically appear here.
                    </p>
                </div>
            </section>
        );
    }

    if (filteredVisits.length === 0) {
        return (
            <section className="space-y-6">
                <div className="rounded-lg border border-dashed border-gray-300 p-10 text-center shadow-sm dark:border-gray-600 ">
                    <p className="text-lg font-semibold">No visits match your search</p>
                    <p className="mt-2 text-sm opacity-70">
                        Try different keywords or clear the search box to review all recent activity.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-8" id="historySection">
            <div className="space-y-10">
                {groupedVisits.map((group) => (
                    <section
                        key={group.label}
                        className="transition"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/80 pb-3 dark:border-gray-700/50">
                            <h2 className="text-sm font-semibold uppercase tracking-wide opacity-70">
                                {group.label}
                            </h2>
                            <span className="inline-flex items-center rounded-full bg-gray-200/70 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700/60 dark:text-gray-200">
                                {group.items.length} {group.items.length === 1 ? 'visit' : 'visits'}
                            </span>
                        </div>
                        <div className="mt-4 space-y-4">
                            {group.items.map((visit, index) => {
                                const host = getHostName(visit.url);
                                const isSaved = savedUrlSet.has(visit.url);
                                const key = `${visit.url}-${visit.visitTime}`;
                                const visitDate = new Date(visit.visitTime);
                                return (
                                    <div key={key} className="grid grid-cols-1 gap-4">
                                        <article className="group">
                                            <div className="flex flex-row items-start justify-between gap-4">
                                                <div className="flex items-start min-w-0 gap-3">
                                                    <img
                                                        src={visit.faviconUrl}
                                                        alt=""
                                                        className="h-5 w-5"
                                                        loading="lazy"
                                                    />
                                                    <div className="min-w-0 space-y-2">
                                                        <a
                                                            href={visit.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="line-clamp-2 text-base font-semibold hover:underline"
                                                        >
                                                            {visit.title || host}
                                                        </a>
                                                        <div className="flex flex-wrap items-center gap-2 text-xs">
                                                            <span className="opacity-[0.5]">
                                                                {host}
                                                            </span>
                                                            <span className='opacity-[0.5]'>{formatRelativeTime(visit.visitTime)}</span>
                                                            <span className='opacity-[0.5]'>{timeFormatter.format(visitDate)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        type="button"
                                                        className={`bs-btn ${isSaved ? 'bs-btn--success' : 'bs-btn--primary'} p-1 text-xs font-semibold flex items-center gap-2`}
                                                        onClick={(event) => {
                                                            event.preventDefault();
                                                            onSaveClick(visit);
                                                        }}
                                                        aria-pressed={isSaved}
                                                    >
                                                        {isSaved ? <MdStar size={16} /> : 'Save'}
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                ))}
            </div>
        </section>
    );
};

export default HistorySection;
