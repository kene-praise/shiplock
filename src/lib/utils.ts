import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatRelativeTime(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const d = typeof value === "string" ? new Date(value) : value;
  const diffMs = Date.now() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return "just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return formatDate(d);
}

// Bucket timestamps into per-day counts over the last `days` days (oldest → newest).
export function dailyCounts(
  dates: (string | Date | null | undefined)[],
  days: number
): number[] {
  const buckets = new Array(days).fill(0);
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const DAY = 86_400_000;
  for (const value of dates) {
    if (!value) continue;
    const d = typeof value === "string" ? new Date(value) : value;
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const idx = days - 1 - Math.round((todayStart - dayStart) / DAY);
    if (idx >= 0 && idx < days) buckets[idx] += 1;
  }
  return buckets;
}

// Running cumulative total of `dates` per day over the last `days` days,
// seeded with `priorTotal` events that occurred before the window.
export function cumulativeDaily(
  dates: (string | Date | null | undefined)[],
  days: number,
  priorTotal = 0
): number[] {
  const perDay = dailyCounts(dates, days);
  let running = priorTotal;
  return perDay.map((n) => (running += n));
}
