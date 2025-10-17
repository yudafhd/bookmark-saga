import type { VisitEntry } from '@/lib/types';

const OFFSETS_DAYS: number[] = [
    0, 2, 7, 10, 14, 18, 21, 25, 28, 32,
    35, 39, 42, 49, 56, 63, 70, 77, 90, 120,
];

const DOMAINS = [
    'soompi.com',
    'allkpop.com',
    'koreaboo.com',
    'mydramalist.com',
    'viki.com',
    'netflix.com',
    'asianwiki.com',
    'dramabeans.com',
    'kprofiles.com',
    'weverse.io',
    'youtube.com',
    'spotify.com',
    'crunchyroll.com',
    'anilist.co',
    'canva.com',
    'notion.so',
    'figma.com',
    'vogue.com',
    'refinery29.com',
    'theeverygirl.com',
];

const TITLES = [
    'Office Capsule Wardrobe: 10 Effortless Looks',
    'Morning Routine: 15-Minute Makeup Before Standup',
    'Notion Templates for Work–Life Balance',
    'K-Pop Focus Playlist for Deep Work',
    'How to Score Concert Tickets (Without Stress)',
    'Blazer Styling Guide: From Desk to Dinner',
    'Weekly Bento Meal Prep for Busy Weeks',
    'Minimal Desk Decor That Boosts Productivity',
    'Skincare to Survive Screen Time',
    'Newest Office-Romance K-Dramas to Binge',
    'Salary Negotiation: Scripts That Work',
    'Calendar Blocking for Overwhelmed Schedules',
    'Self-Care Sunday Checklist (Recharge Fast)',
    'Quick, Polished Hairstyles for 9–5',
    'Professional Email & Slack Etiquette 101',
    'Top K-Pop Comebacks This Month',
    'Anime to Unwind After Work (Cozy Picks)',
    'Beginner’s Guide to Weverse & Official Merch',
    'Weekend Outfits: From Coffee Run to Concert',
    'Budgeting Basics: Paycheck to Peace of Mind',
];


function pick<T>(arr: T[], seed: number): T {
    return arr[seed % arr.length];
}

function makeUrl(domain: string, idx: number): string {
    const paths = ['blog', 'docs', 'guide', 'learn', 'tips', 'news', 'post'];
    const p = paths[idx % paths.length];
    return `https://${domain}/${p}/${idx + 1}`;
}

function favicon(domain: string): string {
    // simple, reliable favicon service
    return `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(domain)}`;
}

function atTimeOfDay(base: number, hours: number, minutes: number): number {
    const d = new Date(base);
    d.setHours(hours, minutes, 0, 0);
    return d.getTime();
}

/**
 * Generate mock VisitEntry[] distributed across 20 groups
 * (today, 2 days ago, 1 week ago, etc.) so HistorySection will
 * group them into human-friendly buckets.
 */
export function makeMockVisits(groups: number = 20): VisitEntry[] {
    const now = Date.now();
    const result: VisitEntry[] = [];

    for (let gi = 0; gi < groups; gi++) {
        const offsetDays = OFFSETS_DAYS[gi] ?? (gi * 7); // fallback: weekly steps
        const dayMs = 24 * 60 * 60 * 1000;
        const baseDay = now - offsetDays * dayMs;

        // 3 items per group with different times-of-day
        const itemsInGroup = 3;

        for (let i = 0; i < itemsInGroup; i++) {
            const domain = pick(DOMAINS, gi * 7 + i);
            const title = pick(TITLES, gi * 11 + i);
            const url = makeUrl(domain, gi * itemsInGroup + i);

            // stagger across morning/afternoon/evening
            const visitTime = i === 0
                ? atTimeOfDay(baseDay, 9, 20)
                : i === 1
                    ? atTimeOfDay(baseDay, 14, 35)
                    : atTimeOfDay(baseDay, 20, 10);

            const entry: VisitEntry = {
                url,
                title,
                visitTime,
                faviconUrl: favicon(domain),
            };
            result.push(entry);
        }
    }

    // Sort newest first to match real data shape
    result.sort((a, b) => b.visitTime - a.visitTime);
    return result;
}

/**
 * Convenience generator with a fixed 20-group distribution:
 * today, 2 days ago, 1 week ago, ... up to ~4 months ago.
 */
export function makeTwentyGroupMock(): VisitEntry[] {
    return makeMockVisits(20);
}