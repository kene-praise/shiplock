interface IconBadgeProps {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
  style?: React.CSSProperties;
}

/**
 * IconBadge — neutral rounded-square container for role/category icons.
 * Matches chanhdai.com's job/education role markers: gray line icon
 * inside a softly elevated square badge. Neutral in both light & dark.
 */
export function IconBadge({ children, className = "", size = "md", style }: IconBadgeProps) {
  const sizeClasses = {
    sm: "w-7 h-7 rounded-[var(--radius-sm)]",
    md: "w-9 h-9 rounded-[var(--radius-md)]",
    lg: "w-11 h-11 rounded-[var(--radius-lg)]",
  };

  return (
    <span
      className={[
        "inline-flex items-center justify-center shrink-0",
        "bg-[var(--component-fill)] border border-[var(--border)]",
        "text-[var(--fg-muted)]",
        sizeClasses[size],
        className,
      ].join(" ")}
      style={{
        outline: "1px solid var(--border)",
        outlineOffset: "2px",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ── Built-in icon set — neutral gray strokes ──────────────────────────

export function CodeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M5 4L1 8l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M11 4l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DesignIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      {/* Compass / drafting tool */}
      <circle cx="8" cy="5.5" r="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 7v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M5.5 13l2.5-2.5 2.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 3.5L8 2l4 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GraduationIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M1.5 6.5L8 4l6.5 2.5L8 9 1.5 6.5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M4.5 8v3c0 .8 1.6 1.5 3.5 1.5s3.5-.7 3.5-1.5V8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M14.5 6.5v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function BriefcaseIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="1.5" y="6" width="13" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <path d="M5.5 6V4.5A1.5 1.5 0 0 1 7 3h2a1.5 1.5 0 0 1 1.5 1.5V6" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M1.5 9.5h13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function ServerIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect x="2" y="3" width="12" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <rect x="2" y="9" width="12" height="4" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="4.5" cy="5" r="0.75" fill="currentColor" />
      <circle cx="4.5" cy="11" r="0.75" fill="currentColor" />
    </svg>
  );
}

export function StarIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
      <path d="M8 2l1.5 3.5L13 6l-2.5 2.5.5 3.5L8 10.5 5 12l.5-3.5L3 6l3.5-.5L8 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}
