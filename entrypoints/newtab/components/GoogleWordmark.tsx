import React, { JSX } from "react";

type GoogleWordmarkProps = {
    size?: number | string;     // px atau unit CSS (default 64)
    weight?: number;            // 300–800 (default 600)
    fontFamily?: string;        // default "Poppins, system-ui, -apple-system, Segoe UI, Roboto, ... "
    as?: keyof JSX.IntrinsicElements; // span | div | h1 | etc (default: span)
    style?: React.CSSProperties;
    title?: string;
};

const COLORS = {
    white: "#ffffff",
    blue: "#4285F4",
    red: "#EA4335",
    yellow: "#FBBC05",
    green: "#34A853",
};

export const GoogleWordmark: React.FC<GoogleWordmarkProps> = ({
    size = 64,
    weight = 600,
    fontFamily = 'Poppins, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',
    as: Tag = "span",
    style,
    title = "Google wordmark (unofficial)",
}) => {
    const base: React.CSSProperties = {
        display: "inline-flex",
        alignItems: "baseline",
        gap: 0,
        lineHeight: 1,
        fontFamily,
        fontWeight: weight,
        fontSize: typeof size === "number" ? `${size}px` : size,
        letterSpacing: "-0.01em", // rapat seperti wordmark
        ...style,
    };

    const letter = () => (
        <span>
            Bookmark
        </span>
    );

    return (
        <Tag aria-label={title} style={base}>
            {letter()}
        </Tag>
    );
};
