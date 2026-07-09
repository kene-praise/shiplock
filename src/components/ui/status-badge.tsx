import { cn } from "@/lib/utils";

export type StatusTone = "approved" | "pending" | "blocked" | "auto" | "disputed" | "neutral";

const tones: Record<StatusTone, { fg: string; bg: string }> = {
  approved: { fg: "var(--status-approved)", bg: "rgba(26, 156, 91, 0.09)" },
  pending: { fg: "var(--status-pending)", bg: "rgba(194, 135, 10, 0.09)" },
  blocked: { fg: "var(--status-blocked)", bg: "rgba(229, 72, 77, 0.09)" },
  auto: { fg: "var(--status-auto)", bg: "rgba(43, 127, 255, 0.09)" },
  disputed: { fg: "var(--status-disputed)", bg: "rgba(224, 124, 36, 0.09)" },
  neutral: { fg: "#888888", bg: "rgba(0, 0, 0, 0.05)" },
};

interface StatusBadgeProps {
  tone?: StatusTone;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

// Muted tint + colored dot — the one badge treatment used across the app.
export function StatusBadge({ tone = "neutral", dot = true, children, className }: StatusBadgeProps) {
  const t = tones[tone];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        className
      )}
      style={{ color: t.fg, backgroundColor: t.bg }}
    >
      {dot && (
        <span
          className="h-1.5 w-1.5 rounded-full shrink-0"
          style={{ backgroundColor: t.fg }}
        />
      )}
      {children}
    </span>
  );
}
