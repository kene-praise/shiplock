import { Badge } from "@/components/ui/badge";

export type StatusTone = "approved" | "pending" | "blocked" | "auto" | "disputed" | "neutral";

const toneToVariant = {
  approved: "success",
  pending: "warning",
  blocked: "danger",
  auto: "accent",
  disputed: "disputed",
  neutral: "default",
} as const;

interface StatusBadgeProps {
  tone?: StatusTone;
  dot?: boolean;
  children: React.ReactNode;
  className?: string;
}

// ShipLock status semantics on top of the base Badge.
export function StatusBadge({ tone = "neutral", dot = true, children, className }: StatusBadgeProps) {
  return (
    <Badge variant={toneToVariant[tone]} size="sm" dot={dot} className={className}>
      {children}
    </Badge>
  );
}
