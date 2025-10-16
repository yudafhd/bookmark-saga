import React from 'react';
import type { VisitEntry } from '@/lib/types';
import { formatRelativeTime, getHost } from '@/lib/utils';
import { StarSolid } from '@/shared/icons';

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
    if (loading) {
        return (
            <section className="space-y-6">
                <p className="text-sm opacity-70">Loading visits…</p>
            </section>
        );
    }

    if (!hasVisits || filteredVisits.length === 0) {
        return (
            <section className="space-y-6">
                <div className="text-center py-12">
                    <p className="text-lg opacity-90">No visits recorded yet.</p>
                    <p className="mt-2 text-sm opacity-70">Visit some websites and come back here.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="grid">
                {filteredVisits.map((visit) => (
                    <article key={visit.url} className="bs-card transition p-3">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <img src={visit.faviconUrl} alt="" className="w-8 h-8 rounded" loading="lazy" />
                                <a
                                    href={visit.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-lg font-medium hover:underline line-clamp-2"
                                >
                                    {visit.title}
                                </a>
                            </div>
                            <div className="flex gap-3">
                                <p className="text-xs opacity-70 truncate">{getHost(visit.url)}</p>
                                <span className="inline-block text-xs opacity-75">
                                    viewed {formatRelativeTime(visit.visitTime)}
                                </span>
                                <button
                                    type="button"
                                    className={`bs-btn ${savedUrlSet.has(visit.url) ? 'bs-btn--success' : 'bs-btn--primary'} px-2 py-1 text-xs font-medium`}
                                    onClick={(event) => {
                                        event.preventDefault();
                                        onSaveClick(visit);
                                    }}
                                >
                                    {savedUrlSet.has(visit.url) ? <StarSolid className="w-3" /> : 'Save'}
                                </button>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
};

export default HistorySection;