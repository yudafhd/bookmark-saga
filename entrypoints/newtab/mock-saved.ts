import type { Folder, FolderItemsMap, FolderItem } from '@/lib/types';

const NOW = Date.now();
const DAY = 24 * 60 * 60 * 1000;

function favicon(domain: string): string {
    return `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(domain)}`;
}

function makeUrl(domain: string, path: string, idx: number): string {
    return `https://${domain}/${path}/${idx + 1}`;
}

const FOLDERS: Folder[] = [
    { id: 'work', name: 'Work', parentId: null },
    { id: 'work-fe', name: 'Frontend', parentId: 'work' },
    { id: 'work-be', name: 'Backend', parentId: 'work' },

    { id: 'personal', name: 'Personal', parentId: null },
    { id: 'personal-travel', name: 'Travel', parentId: 'personal' },
    { id: 'personal-recipes', name: 'Recipes', parentId: 'personal' },

    { id: 'reading', name: 'Reading List', parentId: null },
    { id: 'reading-tech', name: 'Tech', parentId: 'reading' },
    { id: 'reading-design', name: 'Design', parentId: 'reading' },
    { id: 'reading-fun', name: 'Entertainment', parentId: 'reading' },
];

function makeItems(
    entries: Array<{ domain: string; title: string; path?: string }>,
    startOffsetDays: number,
): FolderItem[] {
    return entries.map((e, i) => {
        const savedAt = NOW - (startOffsetDays + i) * DAY - i * 60 * 60 * 1000;
        const visited = i % 2 === 0 ? savedAt - 12 * 60 * 60 * 1000 : null;
        const url = makeUrl(e.domain, e.path ?? 'post', i);
        return {
            url,
            title: e.title,
            faviconUrl: favicon(e.domain),
            savedAt,
            visitTime: visited,
        };
    });
}

export function makeMockSavedData(): { folders: Folder[]; folderItems: FolderItemsMap } {
    const folderItems: FolderItemsMap = {};

    folderItems['work-fe'] = makeItems(
        [
            { domain: 'react.dev', title: 'React Performance Patterns', path: 'learn' },
            { domain: 'tailwindcss.com', title: 'Tailwind Best Practices', path: 'docs' },
            { domain: 'vitejs.dev', title: 'Vite Plugin Guide', path: 'guide' },
            { domain: 'vercel.com', title: 'Next.js App Router Essentials', path: 'blog' },
        ],
        2,
    );

    folderItems['work-be'] = makeItems(
        [
            { domain: 'nodejs.org', title: 'Node Streams Deep Dive', path: 'docs' },
            { domain: 'expressjs.com', title: 'Express Production Checklist', path: 'en/advanced' },
            { domain: 'prisma.io', title: 'Prisma Schema Relations', path: 'docs' },
            { domain: 'postgresql.org', title: 'Postgres Indexing Strategies', path: 'docs' },
        ],
        4,
    );

    folderItems['personal-travel'] = makeItems(
        [
            { domain: 'airbnb.com', title: 'Bali Weekend Getaway', path: 'rooms' },
            { domain: 'booking.com', title: 'Yogyakarta Hotel Picks', path: 'search' },
            { domain: 'maps.google.com', title: 'Cafe Hopping in Bandung', path: 'place' },
            { domain: 'tripadvisor.com', title: 'Best Street Food in Bangkok', path: 'Travel' },
        ],
        6,
    );

    folderItems['personal-recipes'] = makeItems(
        [
            { domain: 'seriouseats.com', title: 'Ultimate Chicken Katsu', path: 'recipes' },
            { domain: 'allrecipes.com', title: '30-Minute Pasta Primavera', path: 'recipe' },
            { domain: 'nytimes.com', title: 'No-Knead Bread 2.0', path: 'cooking' },
            { domain: 'justonecookbook.com', title: 'Gyudon (Beef Bowl)', path: 'recipes' },
        ],
        8,
    );

    folderItems['reading-tech'] = makeItems(
        [
            { domain: 'dev.to', title: 'Understanding Web Streams', path: 'post' },
            { domain: 'kentcdodds.com', title: 'Testing React Like a Pro', path: 'blog' },
            { domain: 'css-tricks.com', title: 'Modern CSS Layout Patterns', path: 'guide' },
            { domain: 'web.dev', title: 'Optimize LCP and CLS', path: 'learn' },
        ],
        3,
    );

    folderItems['reading-design'] = makeItems(
        [
            { domain: 'dribbble.com', title: 'Neobrutalism UI Inspiration', path: 'shots' },
            { domain: 'behance.net', title: 'Minimal Dashboard Concepts', path: 'gallery' },
            { domain: 'figma.com', title: 'Auto Layout Recipes', path: 'community' },
            { domain: 'uxplanet.org', title: 'UX Writing Microcopy', path: 'articles' },
        ],
        5,
    );

    folderItems['reading-fun'] = makeItems(
        [
            { domain: 'youtube.com', title: 'Lo-fi Hip Hop Beats to Focus', path: 'watch' },
            { domain: 'netflix.com', title: 'Cozy K-Drama Picks', path: 'watch' },
            { domain: 'anilist.co', title: 'Fall Anime Watchlist', path: 'anime' },
            { domain: 'crunchyroll.com', title: 'Slice of Life Recommendations', path: 'series' },
        ],
        7,
    );

    // Put a couple items in a root folder too
    folderItems['reading'] = makeItems(
        [
            { domain: 'notion.so', title: 'Bookmark Saga Project Notes', path: 'page' },
            { domain: 'canva.com', title: 'Brand Kit Ideas', path: 'design' },
        ],
        1,
    );

    return {
        folders: FOLDERS,
        folderItems,
    };
}