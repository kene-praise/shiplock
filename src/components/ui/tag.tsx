interface TagProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Tag — neutral monospace pill for tech labels, weeks, and categories.
 * Subtle border, barely-there bg, monospace font, full pill radius.
 */
export function Tag({ children, className = "" }: TagProps) {
  return (
    <span
      className={[
        "inline-flex items-center whitespace-nowrap",
        "px-2.5 py-1",
        "text-[12px] font-mono leading-none",
        "rounded-[var(--radius-full)]",
        "bg-[var(--component-fill)] border border-[var(--border)]",
        "text-[var(--fg-secondary)]",
        className,
      ].join(" ")}
    >
      {children}
    </span>
  );
}
