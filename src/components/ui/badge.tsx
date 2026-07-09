type BadgeVariant =
  | "default"
  | "accent"
  | "teal"
  | "success"
  | "warning"
  | "danger"
  | "disputed"
  | "outline";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: "sm" | "md";
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: "bg-[var(--bg-muted)] text-[var(--fg-secondary)]",
  accent: "bg-[var(--accent-muted)] text-[var(--accent)]",
  teal: "bg-[var(--teal-muted)] text-[var(--teal)]",
  success: "bg-[var(--success-muted)] text-[var(--success)]",
  warning: "bg-[var(--warning-muted)] text-[var(--warning)]",
  danger: "bg-[var(--danger-muted)] text-[var(--danger)]",
  disputed: "bg-[var(--disputed-muted)] text-[var(--disputed)]",
  outline: "border border-[var(--border-strong)] text-[var(--fg-secondary)] bg-transparent",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-[var(--fg-muted)]",
  accent: "bg-[var(--accent)]",
  teal: "bg-[var(--teal)]",
  success: "bg-[var(--success)]",
  warning: "bg-[var(--warning)]",
  danger: "bg-[var(--danger)]",
  disputed: "bg-[var(--disputed)]",
  outline: "bg-[var(--fg-muted)]",
};

export function Badge({
  variant = "default",
  size = "md",
  dot = false,
  children,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1.5 font-medium leading-none rounded-[var(--radius-full)]",
        size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-1.5 text-sm",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {dot && (
        <span
          className={[
            "rounded-full shrink-0",
            dotColors[variant],
            size === "sm" ? "w-1 h-1" : "w-1.5 h-1.5",
          ].join(" ")}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
