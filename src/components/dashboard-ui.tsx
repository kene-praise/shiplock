import type { LucideIcon } from "@/components/icons";
import Link from "next/link";

// ─── Tone map — resolves to the ported portfolio tokens ──────────────────────
// fg/bg are CSS var() strings so charts and badges adapt to light/dark.

export const T = {
  blue:  { fg: "var(--accent)",   bg: "var(--accent-muted)"  },
  green: { fg: "var(--success)",  bg: "var(--success-muted)" },
  amber: { fg: "var(--warning)",  bg: "var(--warning-muted)" },
  red:   { fg: "var(--danger)",   bg: "var(--danger-muted)"  },
  gray:  { fg: "var(--fg-muted)", bg: "var(--component-fill)" },
} as const;
export type ToneKey = keyof typeof T;

const GRID = "var(--border)";
const ZERO_BAR = "var(--bg-muted)";

// ─── SVG charts ───────────────────────────────────────────────────────────────

// Generic bar chart — annotate=true adds "+N" labels above non-zero bars
export function BarChart({ points, color, height = 56, annotate = false }: {
  points: number[]; color: string; height?: number; annotate?: boolean;
}) {
  const W = 240, H = height;
  const max = Math.max(...points, 1);
  const gap = W / points.length;
  const bw  = Math.max(4, gap * 0.54);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block" }}>
      {[0.33, 0.67, 1].map(p => (
        <line key={p} x1="0" y1={H - (H - 8) * p - 4} x2={W} y2={H - (H - 8) * p - 4}
          stroke={GRID} strokeWidth="0.75" />
      ))}
      {points.map((v, i) => {
        const bh   = v === 0 ? 2 : Math.max(5, (v / max) * (H - 10));
        const x    = i * gap + (gap - bw) / 2;
        const isLast = i === points.length - 1;
        return (
          <g key={i}>
            <rect x={x} y={H - bh} width={bw} height={bh} rx="2"
              fill={v === 0 ? ZERO_BAR : color} opacity={v === 0 || isLast ? 1 : 0.5} />
            {annotate && v > 0 && (
              <text x={x + bw / 2} y={H - bh - 3} textAnchor="middle" fontSize="7.5"
                fill={color} opacity={isLast ? 1 : 0.73} fontFamily="var(--font-mono)" fontWeight="600">+{v}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// Line chart with gradient area fill and halo end-dot
export function LineChart({ points, color, height = 56 }: { points: number[]; color: string; height?: number }) {
  const W = 240, H = height;
  const max = Math.max(...points, 1);
  const min = Math.min(...points);
  const range = max - min || 1;
  const yFor  = (v: number) => H - ((v - min) / range) * (H - 16) - 8;
  const coords = points.map((v, i) => ({ x: (i / (points.length - 1)) * W, y: yFor(v) }));
  const pathD  = `M${coords.map(c => `${c.x},${c.y}`).join(" L")}`;
  const last   = coords[coords.length - 1];
  const uid    = `lg${color.replace(/[^a-z0-9]/gi, "")}${height}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.33, 0.67, 1].map(p => (
        <line key={p} x1="0" y1={H - (H - 8) * p - 4} x2={W} y2={H - (H - 8) * p - 4}
          stroke={GRID} strokeWidth="0.75" />
      ))}
      <path d={`${pathD} L${W},${H} L0,${H} Z`} fill={`url(#${uid})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="5.5" fill={color} opacity="0.15" />
      <circle cx={last.x} cy={last.y} r="2.75" fill={color} />
      <circle cx={last.x} cy={last.y} r="1.2" fill="var(--surface)" />
    </svg>
  );
}

// Velocity chart — 4 weeks of daily bars with week bands, avg line, and week labels
export function VelocityChart({ points, weeks, color }: {
  points: number[];
  weeks: { week: string; done: number; total: number }[];
  color: string;
}) {
  const W = 800, H = 96;
  const LABEL_ROW = 16; // reserved at bottom for week labels
  const chartH = H - LABEL_ROW;
  const max = Math.max(...points, 1);
  const weekW = W / 4;
  const dayW  = weekW / 7;
  const bw    = Math.max(5, dayW * 0.62);
  const active = points.filter(Boolean);
  const avg   = active.length ? active.reduce((a, b) => a + b, 0) / active.length : 0;
  const avgY  = chartH - (avg / max) * (chartH - 12) - 6;
  const weekOpacity = [1, 0.82, 0.58, 0.22];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" preserveAspectRatio="none" style={{ display: "block" }}>
      {/* Alternating week bands */}
      {[0, 2].map(i => (
        <rect key={i} x={i * weekW + 1} y={0} width={weekW - 2} height={chartH} fill="var(--bg-subtle)" />
      ))}

      {/* Grid lines */}
      {[0.33, 0.67, 1].map(p => (
        <line key={p} x1="0" y1={chartH - (chartH - 10) * p - 5} x2={W} y2={chartH - (chartH - 10) * p - 5}
          stroke={GRID} strokeWidth="0.75" />
      ))}

      {/* Bars */}
      {points.map((v, i) => {
        const weekIdx = Math.floor(i / 7);
        const bh  = v === 0 ? 2 : Math.max(6, (v / max) * (chartH - 10));
        const x   = i * dayW + (dayW - bw) / 2;
        return <rect key={i} x={x} y={chartH - bh} width={bw} height={bh} rx="2.5"
          fill={v === 0 ? ZERO_BAR : color} opacity={v === 0 ? 1 : weekOpacity[weekIdx]} />;
      })}

      {/* Average dashed line */}
      <line x1="0" y1={avgY} x2={W * 0.72} y2={avgY} stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
      <rect x="2" y={avgY - 8} width="44" height="11" rx="2.5" fill="var(--surface)" />
      <text x="5" y={avgY + 1.5} fontSize="8.5" fill={color} fontFamily="var(--font-mono)" fontWeight="600" opacity="0.75">
        avg {avg.toFixed(1)}/day
      </text>

      {/* Week dividers */}
      {[1, 2, 3].map(i => (
        <line key={i} x1={i * weekW} y1="0" x2={i * weekW} y2={chartH}
          stroke="var(--border-strong)" strokeWidth="0.75" />
      ))}

      {/* Bottom label row: week name + score */}
      {weeks.map((w, i) => {
        const pct = w.total > 0 ? w.done / w.total : 0;
        const scoreColor = pct >= 1 ? T.green.fg : pct >= 0.5 ? color : pct > 0 ? T.amber.fg : T.gray.fg;
        return (
          <g key={w.week}>
            <text x={i * weekW + 5} y={H - 3} fontSize="9" fill="var(--fg-muted)"
              fontFamily="var(--font-mono)" fontWeight="500">{w.week}</text>
            <text x={i * weekW + weekW - 5} y={H - 3} fontSize="9" fill={scoreColor}
              fontFamily="var(--font-mono)" fontWeight="600" textAnchor="end">{w.done}/{w.total}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── UI primitives ────────────────────────────────────────────────────────────

export function KpiCard({ icon: Icon, label, value, sub, tone = "blue" }: {
  icon: LucideIcon; label: string; value: string; sub?: string; tone?: ToneKey;
}) {
  const t = T[tone];
  return (
    <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-4 transition-[border-color,box-shadow] duration-150 hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)]">
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>{label}</SectionLabel>
        <span
          className="size-7 rounded-[var(--radius-sm)] flex items-center justify-center border border-[var(--border)]"
          style={{ background: t.bg, outline: "1px solid var(--border)", outlineOffset: "2px" }}
        >
          <Icon size={13} strokeWidth={2} style={{ color: t.fg }} />
        </span>
      </div>
      <div className="text-[28px] font-semibold tabular-nums tracking-tight text-[var(--fg)] leading-none">{value}</div>
      {sub && <div className="text-[12px] text-[var(--fg-muted)] mt-1.5">{sub}</div>}
    </div>
  );
}

export function Badge({ label, tone }: { label: string; tone: ToneKey }) {
  const t = T[tone];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-[var(--radius-full)] leading-none tabular-nums"
      style={{ background: t.bg, color: t.fg }}>
      <span className="w-1 h-1 rounded-full shrink-0" style={{ background: t.fg }} aria-hidden />
      {label}
    </span>
  );
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--fg-muted)]">{children}</span>;
}

// Link styled as the skeuomorphic CTA button — for server-rendered actions
export function CtaLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="btn-cta !h-8 !px-3.5 !text-[12.5px]">
      {children}
    </Link>
  );
}

// Link styled as the secondary button
export function SecondaryLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="btn-secondary !h-8 !px-3.5 !text-[12.5px]">
      {children}
    </Link>
  );
}

// Page header — compact single row: title, inline meta, right-aligned actions.
// Context lives in the breadcrumb top bar, so this stays slim.
export function PageHeader({ title, meta, children }: {
  title: string; meta?: React.ReactNode; children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 min-h-8 animate-enter">
      <h1 className="text-[14px] font-semibold tracking-tight text-[var(--fg)] leading-none">{title}</h1>
      {meta && <p className="text-[11.5px] text-[var(--fg-muted)] tabular-nums leading-none mt-px">{meta}</p>}
      {children && <div className="ml-auto flex items-center gap-2">{children}</div>}
    </div>
  );
}

