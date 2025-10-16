import React from 'react';

export type IconProps = React.SVGProps<SVGSVGElement> & { size?: number | string };
export type BookmarkSagaIcon = React.FC<IconProps>;

const IconBase = React.forwardRef<SVGSVGElement, IconProps>(function IconBase(
    { children, size, width, height, ...rest },
    ref
) {
    const w = width ?? size;
    const h = height ?? size;
    return (
        <svg
            ref={ref}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            width={w}
            height={h}
            {...rest}
        >
            {children}
        </svg>
    );
});

/**
 * Basic UI icons (stroke-only, Lucide-like)
 */
export const Plus: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
    </IconBase>
);

export const ArrowRight: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M5 12h14" />
        <path d="M12 5l7 7-7 7" />
    </IconBase>
);
export const ArrowRightIcon: BookmarkSagaIcon = (props) => <ArrowRight {...props} />;

export const ArrowLeft: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
    </IconBase>
);

export const ArrowLeftCircle: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M14 8l-4 4 4 4" />
        <path d="M16 12H8" />
    </IconBase>
);

export const ChevronRight: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M9 18l6-6-6-6" />
    </IconBase>
);

export const ChevronLeft: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M15 18l-6-6 6-6" />
    </IconBase>
);

export const ChevronDownIcon: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M6 9l6 6 6-6" />
    </IconBase>
);

export const ChevronUpIcon: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M18 15l-6-6-6 6" />
    </IconBase>
);

export const Menu: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M3 6h18" />
        <path d="M3 12h18" />
        <path d="M3 18h18" />
    </IconBase>
);

export const Search: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <circle cx="11" cy="11" r="7" />
        <path d="M21 21l-4.35-4.35" />
    </IconBase>
);

export const Heart: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z" />
    </IconBase>
);

export const MessageCircle: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M21 11.5a8.5 8.5 0 1 1-3.6-6.9L21 4v7.5z" />
    </IconBase>
);

export const Send: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M22 2L11 13" />
        <path d="M22 2l-7 20-4-9-9-4 20-7z" />
    </IconBase>
);

export const MoreHorizontal: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <circle cx="5" cy="12" r="1.5" />
        <circle cx="12" cy="12" r="1.5" />
        <circle cx="19" cy="12" r="1.5" />
    </IconBase>
);

export const XIcon: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M18 6L6 18" />
        <path d="M6 6l12 12" />
    </IconBase>
);

export const XCircle: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6" />
        <path d="M9 9l6 6" />
    </IconBase>
);

export const CheckIcon: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path
            d="M20 6 9 17l-5-5"
            strokeWidth={3.5}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </IconBase>
);
export const CheckCircle2: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M16 10l-4 4-2-2" />
    </IconBase>
);

export const AlertTriangle: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M12 2l10 18H2L12 2z" />
        <path d="M12 8v5" />
        <path d="M12 17h.01" />
    </IconBase>
);

export const Info: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4" />
        <path d="M12 8h.01" />
    </IconBase>
);

export const Mail: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="M3 7l9 6 9-6" />
    </IconBase>
);

export const Github: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path
            d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.68.5.09.68-.22.68-.49v-1.73c-2.78.62-3.37-1.36-3.37-1.36-.46-1.2-1.13-1.52-1.13-1.52-.93-.65.07-.64.07-.64 1.03.07 1.57 1.08 1.57 1.08.91 1.59 2.4 1.13 2.99.86.09-.67.36-1.13.65-1.39-2.22-.26-4.56-1.15-4.56-5.14 0-1.14.39-2.06 1.03-2.78-.1-.26-.45-1.31.1-2.74 0 0 .84-.28 2.76 1.06A9.26 9.26 0 0 1 12 7.5a9.25 9.25 0 0 1 2.5.34c1.92-1.34 2.76-1.06 2.76-1.06.55 1.43.2 2.48.1 2.74.64.72 1.03 1.64 1.03 2.78 0 4-2.34 4.87-4.57 5.13.37.33.7.97.7 1.96v2.9c0 .27.18.59.69.49A10.26 10.26 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z"
            strokeWidth={1.6}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </IconBase>
);

export const Linkedin: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8" cy="8" r="1.5" />
        <path d="M6.5 18v-7h3v7" />
        <path d="M12 18v-4.5a2.5 2.5 0 1 1 5 0V18" />
    </IconBase>
);
export const LinkedinIcon: BookmarkSagaIcon = (props) => <Linkedin {...props} />;

export const TwitterIcon: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M22 5.9a8.4 8.4 0 0 1-2.4.7 4.1 4.1 0 0 0 1.8-2.3 8.2 8.2 0 0 1-2.6 1 4.1 4.1 0 0 0-7 3.8A11.6 11.6 0 0 1 3 5.2a4.1 4.1 0 0 0 1.3 5.5 4 4 0 0 1-1.9-.5 4.1 4.1 0 0 0 3.3 4 4 4 0 0 1-1.9.1 4.1 4.1 0 0 0 3.9 2.9A8.3 8.3 0 0 1 2 19.3 11.7 11.7 0 0 0 8.3 21C16 21 20.3 14.6 20 9.1a8.4 8.4 0 0 0 2-3.2z" />
    </IconBase>
);

export const Instagram: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17" cy="7" r="1" />
    </IconBase>
);
export const InstagramIcon: BookmarkSagaIcon = (props) => <Instagram {...props} />;

export const MailIcon: BookmarkSagaIcon = (props) => <Mail {...props} />;

export const ArrowLeftIcon: BookmarkSagaIcon = (props) => <ArrowLeft {...props} />;

export const ChevronRightIcon: BookmarkSagaIcon = (props) => <ChevronRight {...props} />;

export const Filter: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M3 4h18l-6 8v6l-6 2v-8L3 4z" />
    </IconBase>
);

export const Frame: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
    </IconBase>
);

export const LayoutGrid: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
    </IconBase>
);

export const Quote: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M7 7h5v6H6a4 4 0 0 1 4-4" />
        <path d="M17 7h5v6h-6a4 4 0 0 1 4-4" />
    </IconBase>
);

export const Sparkles: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M12 2l2 5 5 2-5 2-2 5-2-5-5-2 5-2 2-5z" />
        <path d="M19 14l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2z" />
    </IconBase>
);

// export const User: BookmarkSagaIcon = (props) => (
//     <IconBase {...props}>
//         <circle cx="12" cy="8" r="4" />
//         <path d="M4 20a8 8 0 0 1 16 0" />
//     </IconBase>
// );

export const LogIn: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M15 3h6v18h-6" />
        <path d="M10 17l5-5-5-5" />
        <path d="M15 12H3" />
    </IconBase>
);

export const LogOut: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M15 3h6v18h-6" />
        <path d="M15 12H3" />
        <path d="M10 7l-5 5 5 5" />
    </IconBase>
);

export const Link2Icon: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M10 13a5 5 0 0 0 7.1 0l2-2a5 5 0 1 0-7.1-7.1l-1 1" />
        <path d="M14 11a5 5 0 0 0-7.1 0l-2 2a5 5 0 1 0 7.1 7.1l1-1" />
    </IconBase>
);

export const ImageIcon: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <circle cx="8.5" cy="10" r="1.5" />
        <path d="M21 17l-5-5-4 4-3-3-4 4" />
    </IconBase>
);
// Alias to support `import { Image as ImageIcon } from "volaroid-icon"`
export const Image: BookmarkSagaIcon = (props) => <ImageIcon {...props} />;

export const BoltIcon: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8z" />
    </IconBase>
);

export const ShieldCheckIcon: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" />
        <path d="M9 12l2 2 4-4" />
    </IconBase>
);

export const CpuChipIcon: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <rect x="7" y="7" width="10" height="10" rx="2" />
        <path d="M7 3v4M12 3v4M17 3v4M7 21v-4M12 21v-4M17 21v-4M3 7h4M3 12h4M3 17h4M21 7h-4M21 12h-4M21 17h-4" />
    </IconBase>
);

export const GoogleIcon: BookmarkSagaIcon = (props) => (
    <IconBase {...props} stroke="none">
        <path fill="#4285F4" d="M23.49 12.27c0-.85-.07-1.47-.22-2.12H12v4.01h6.51c-.13 1.1-.84 2.77-2.41 3.89l-.02.13 3.5 2.71.24.02c2.21-2.04 3.67-5.05 3.67-8.64z" />
        <path fill="#34A853" d="M12 24c3.32 0 6.11-1.09 8.15-2.98l-3.88-3c-1.04.73-2.44 1.24-4.27 1.24-3.27 0-6.05-2.2-7.04-5.23l-.12.01-3.8 2.94-.05.11C3.99 21.67 7.7 24 12 24z" />
        <path fill="#FBBC05" d="M4.96 13.03c-.23-.67-.36-1.39-.36-2.12 0-.74.13-1.46.35-2.12l-.01-.14-3.85-2.98-.13.06C.35 7.27 0 8.61 0 10c0 1.38.35 2.72.96 3.87l3.99-3.08z" />
        <path fill="#EA4335" d="M12 4.75c2.31 0 3.86.99 4.75 1.82l3.47-3.39C18.1 1.12 15.32 0 12 0 7.7 0 3.99 2.33 1.94 6l4.01 3.08C6.94 6.05 9.73 4.75 12 4.75z" />
    </IconBase>
);
export const Loader2: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M12 2a10 10 0 1 0 10 10" />
    </IconBase>
);

export const Download: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M7 10l5 5 5-5" />
        <path d="M12 15V3" />
    </IconBase>
);
export const DownloadIcon: BookmarkSagaIcon = (props) => <Download {...props} />;

export const Eye: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
        <circle cx="12" cy="12" r="3" />
    </IconBase>
);
export const EyeIcon: BookmarkSagaIcon = (props) => <Eye {...props} />;

export const Crown: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M2 18l2-11 6 5 6-5 2 11H2z" />
        <path d="M2 18h20" />
    </IconBase>
);

export const Film: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M7 4v16M17 4v16M2 8h20M2 12h20M2 16h20" />
    </IconBase>
);

export const Camera: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h3l2-3h8l2 3h3a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
    </IconBase>
);

export const BookOpen: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M12 4v16" />
        <path d="M19 4H12a7 7 0 0 0-7 7v9c1.5-1 3.5-1.5 7-1.5h7V4z" />
        <path d="M5 4h7" />
    </IconBase>
);

// Aliases expected by existing imports
export const X: BookmarkSagaIcon = (props) => <XIcon {...props} />;

export const GithubIcon: BookmarkSagaIcon = (props) => <Github {...props} />;
export const InstagramLogo: BookmarkSagaIcon = (props) => <Instagram {...props} />;

/**
 * Aliases for convenience to cover mixed naming in existing code
 */
export { Mail as MailOutline };

/**
 * End of icons
 */
// Extra icons to cover existing usages across the project

export const RefreshCw: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
    </IconBase>
);

export const Refresh: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M21 10V3h-7" />
        <path d="M3 14v7h7" />
        <path d="M21 10a9 9 0 1 0-4.5 7.77" />
    </IconBase>
);

export const History: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M3 3v5h5" />
        <path d="M3.05 13a9 9 0 1 0 .95-4.5" />
        <path d="M12 7v5l3 2" />
    </IconBase>
);

export const Saved: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M8.5 4h7a2.5 2.5 0 0 1 2.5 2.5V20l-6-3.5L6 20V6.5A2.5 2.5 0 0 1 8.5 4Z" />
        <path d="M9.5 10.5l2 2 3.5-3.5" />
    </IconBase>
);

export const Grid3X3: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18" />
        <path d="M3 15h18" />
        <path d="M9 3v18" />
        <path d="M15 3v18" />
    </IconBase>
);
// Extra requested icons

export const Pencil: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </IconBase>
);
// Aliases
export const Edit: BookmarkSagaIcon = (props) => <Pencil {...props} />;
export const EditIcon: BookmarkSagaIcon = (props) => <Pencil {...props} />;

export const Trash: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M5 6l1 14a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-14" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
    </IconBase>
);
export const TrashIcon: BookmarkSagaIcon = (props) => <Trash {...props} />;

export const PhotoStack2: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        {/* back photo */}
        <rect x="4" y="4" width="14" height="10" rx="2" />
        {/* front photo offset */}
        <rect x="6" y="8" width="14" height="10" rx="2" />
        {/* simple mountains + sun on front */}
        <path d="M9 15l3-3 3 3 3-3" />
        <circle cx="12" cy="11" r="1" />
    </IconBase>
);
// Alias
export const PhotoStack: BookmarkSagaIcon = (props) => <PhotoStack2 {...props} />;

export const Settings: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2v3" />
        <path d="M12 19v3" />
        <path d="M2 12h3" />
        <path d="M19 12h3" />
        <path d="M4.9 4.9l2.1 2.1" />
        <path d="M16.9 16.9l2.1 2.1" />
        <path d="M4.9 19.1l2.1-2.1" />
        <path d="M16.9 7.1l2.1-2.1" />
    </IconBase>
);
export const Cog: BookmarkSagaIcon = (props) => <Settings {...props} />;

export const Calendar: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4" />
        <path d="M3 10h18" />
    </IconBase>
);
export const Clock: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 8v5l3 2" />
    </IconBase>
);
export const Bell: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </IconBase>
);
export const Copy: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <rect x="9" y="9" width="13" height="13" rx="2" />
        <rect x="2" y="2" width="13" height="13" rx="2" />
    </IconBase>
);
export const Save: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M19 21H5a2 2 0 0 1-2-2V5h13l3 3v11a2 2 0 0 1-2 2z" />
        <path d="M17 21v-8H7v8" />
        <path d="M7 5v4h8" />
    </IconBase>
);
export const Upload: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <path d="M7 10l5-5 5 5" />
        <path d="M12 15V5" />
    </IconBase>
);
export const FolderClosed: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M3 6a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <path d="M3 10h18" />
    </IconBase>
);

export const FolderOpen: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M3 7a2 2 0 0 1 2-2h4l2 2h9a2 2 0 0 1 1.86 2.49l-1.4 6.98A2 2 0 0 1 14.52 19H5.48a2 2 0 0 1-1.97-1.53L2.62 10.8A2 2 0 0 1 4.57 8H21" />
    </IconBase>
);

export const Folder: BookmarkSagaIcon = (props) => <FolderOpen {...props} />;
export const File: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
    </IconBase>
);
export const StarOutline: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z" />
    </IconBase>
);

export const StarSolid: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path
            d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2z"
            fill="currentColor"
            stroke="none"
        />
    </IconBase>
);

export const Star: BookmarkSagaIcon = (props) => <StarOutline {...props} />;
export const StarOff: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M2 2l20 20" />
        <path d="M12 8l2 4 4 .5-3 3 .75 4.5L12 18l-3.75 2L9 15.5l-3-3 4-.5 2-4z" />
    </IconBase>
);
export const Tag: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M20 10l-8-8H4v8l8 8 8-8z" />
        <path d="M7.5 7.5h.01" />
    </IconBase>
);
export const PlusCircle: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 8v8M8 12h8" />
    </IconBase>
);
export const MinusCircle: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 12h8" />
    </IconBase>
);
export const CheckSquare: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 12l2 2 4-4" />
    </IconBase>
);
export const Square: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
    </IconBase>
);
export const EyeOff: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a20.29 20.29 0 0 1 5.06-5.94" />
        <path d="M1 1l22 22" />
        <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
    </IconBase>
);
export const ExternalLink: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <path d="M7 7h-2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-2" />
        <path d="M15 3h6v6" />
        <path d="M10 14L21 3" />
    </IconBase>
);

// Bookmark (outline)
export const Bookmark: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        {/* bookmark body */}
        <path d="M8.5 4h7a2.5 2.5 0 0 1 2.5 2.5V20l-6-3.5L6 20V6.5A2.5 2.5 0 0 1 8.5 4Z" />
    </IconBase>
);

// BookmarkSolid (isi penuh)
export const BookmarkSolid: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        {/* use fill to render solid; IconBase sets stroke by default */}
        <path
            d="M8.5 4h7A2.5 2.5 0 0 1 18 6.5V20l-6-3.5L6 20V6.5A2.5 2.5 0 0 1 8.5 4Z"
            fill="currentColor"
            stroke="none"
        />
    </IconBase>
);

// BookmarkCheck (saved state)
export const BookmarkCheck: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        {/* badan bookmark */}
        <path d="M8.5 4h7a2.5 2.5 0 0 1 2.5 2.5V20l-6-3.5L6 20V6.5A2.5 2.5 0 0 1 8.5 4Z" />
        {/* check mark inside */}
        <path d="M9.5 10.5l2.2 2.2 4-4" />
    </IconBase>
);


export const User: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="8" r="3" />
        <path d="M4 20a8 8 0 0 1 16 0" />
    </IconBase>
);

export const UserCircle: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="9" r="3" />
        <path d="M7 18a5 5 0 0 1 10 0" />
    </IconBase>
);

export const UserCheck: BookmarkSagaIcon = (props) => (
    <IconBase {...props}>
        <circle cx="10" cy="8" r="3" />
        <path d="M2 20a8 8 0 0 1 12 0" />
        <path d="m15 9.5 2 2 3.5-3.5" />
    </IconBase>
);