import React, { useMemo } from 'react';
import type { VisitEntry } from '@/lib/types';
import { getHostName } from '@/lib/utils';
import { formatRelativeTime } from '@/lib/time';
import { MdStar } from 'react-icons/md';

interface HistoryGroupListProps {
    groupedVisits: Array<{ label: string; items: VisitEntry[] }>;
    savedUrlSet: Set<string>;
    onSaveClick: (visit: VisitEntry) => void;
}

const HistoryGroupList: React.FC<HistoryGroupListProps> = ({
    groupedVisits,
    savedUrlSet,
    onSaveClick,
}) => {
    const timeFormatter = useMemo(
        () => new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }),
        [],
    );

    return (
        <>
            {groupedVisits.map((group) => (
                <section key={group.label} className="transition">
                    <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200/80 pb-3 dark:border-gray-700/50">
                        <h2 className="text-sm font-semibold uppercase tracking-wide opacity-70">
                            {group.label}
                        </h2>
                        <span className="inline-flex items-center rounded-full bg-gray-200/70 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-700/60 dark:text-gray-200">
                            {group.items.length} {group.items.length === 1 ? 'visit' : 'visits'}
                        </span>
                    </div>

                    <div className="mt-4 space-y-4">
                        {group.items.map((visit) => {
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
                                                        <span className="opacity-[0.5]">{host}</span>
                                                        <span className="opacity-[0.5]">
                                                            {formatRelativeTime(visit.visitTime)}
                                                        </span>
                                                        <span className="opacity-[0.5]">{timeFormatter.format(visitDate)}</span>
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
        </>
    );
};

export default HistoryGroupList;