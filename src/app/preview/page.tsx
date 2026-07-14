import {
  LayoutDashboard, GitBranch, FileCheck, CheckSquare, // preview routes
  AlertTriangle, CheckCircle2, TrendingUp, Clock, Layers,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Demo data ────────────────────────────────────────────────────────────────

const PROJECT = { name: "Kola POS System", deadline: "Dec 15, 2025" };

const TASK_STATS = { total: 24, done: 14, inProgress: 4, blocked: 2, notStarted: 4 };
const COMPLETION_PCT = Math.round((TASK_STATS.done / TASK_STATS.total) * 100);

const DAILY_VELOCITY = [2,3,1,4,2,0,0, 3,2,1,3,1,0,0, 1,3,2,0,1,0,0, 1,0,0,0,0,0,0];
const DAILY_SCOPE    = [0,0,1,0,0,0,1, 0,1,0,0,1,0,1];

const WEEK_DATA = [
  { week: "W1", done: 6, total: 6 },
  { week: "W2", done: 5, total: 6 },
  { week: "W3", done: 3, total: 6 },
  { week: "W4", done: 0, total: 6 },
];

const BLOCKED_ITEMS = [
  { refCode: "TASK-007", title: "Payment gateway webhook",    blockedBy: "Paystack API credentials not provided", elapsed: "51h", critical: true  },
  { refCode: "TASK-012", title: "SMS notification delivery", blockedBy: "Provider rate limit — awaiting upgrade", elapsed: "26h", critical: false },
];

const SCOPE_CHANGES = [
  { id: "1", title: "Add loyalty points engine",   source: "Client",      status: "pending",  impact: "medium", est: 3,    createdAt: "1d ago", description: "Points-per-purchase system with redemption at checkout. Est. 3–4 days." },
  { id: "2", title: "Bulk product import via CSV", source: "Stakeholder", status: "accepted", impact: "low",    est: 1,    createdAt: "3d ago", description: "Allow staff to upload a CSV of products. Est. 1 day." },
  { id: "3", title: "Multi-currency pricing",      source: "Client",      status: "rejected", impact: "high",   est: 5,    createdAt: "5d ago", description: "USD and GBP alongside NGN. Requires exchange-rate API + tax recalcs." },
  { id: "4", title: "WhatsApp receipt delivery",   source: "Client",      status: "deferred", impact: "low",    est: null, createdAt: "6d ago", description: "Send receipts via WhatsApp Business API instead of SMS only." },
];

const REQUIREMENTS = [
  { refCode: "REQ-001", title: "POS terminal with offline mode",  cls: "mvp",          status: "approved",         auto: false },
  { refCode: "REQ-002", title: "Real-time inventory sync",        cls: "mvp",          status: "approved",         auto: false },
  { refCode: "REQ-003", title: "Staff role management (3 tiers)", cls: "mvp",          status: "approved",         auto: true  },
  { refCode: "REQ-004", title: "Sales analytics dashboard",       cls: "mvp",          status: "approved",         auto: false },
  { refCode: "REQ-005", title: "Customer receipt history",        cls: "mvp",          status: "pending_approval", auto: false },
  { refCode: "REQ-006", title: "Paystack payment gateway",        cls: "mvp",          status: "approved",         auto: false },
  { refCode: "REQ-007", title: "Audit log export (CSV)",          cls: "mvp",          status: "pending_approval", auto: false },
  { refCode: "REQ-008", title: "Loyalty points engine",           cls: "post_mvp",     status: "draft",            auto: false },
  { refCode: "REQ-009", title: "WhatsApp notifications",          cls: "post_mvp",     status: "draft",            auto: false },
  { refCode: "REQ-010", title: "Multi-currency pricing",          cls: "out_of_scope", status: "disputed",         auto: false },
];

const TASKS_ATTENTION = [
  { refCode: "TASK-007", title: "Payment gateway webhook",   status: "blocked",     priority: "P0", blockedBy: "Paystack credentials" as string | null },
  { refCode: "TASK-012", title: "SMS notification delivery", status: "blocked",     priority: "P1", blockedBy: "Provider rate limit" as string | null },
  { refCode: "TASK-014", title: "Inventory sync module",     status: "in_progress", priority: "P1", blockedBy: null as string | null },
  { refCode: "TASK-016", title: "Report export",             status: "in_progress", priority: "P2", blockedBy: null as string | null },
  { refCode: "TASK-019", title: "Staff permission matrix",   status: "in_progress", priority: "P1", blockedBy: null as string | null },
];
const TASKS_QUEUE = [
  { refCode: "TASK-021", title: "Offline mode cache layer",    priority: "P2" },
  { refCode: "TASK-022", title: "Audit trail export",          priority: "P3" },
  { refCode: "TASK-023", title: "Multi-branch rollout config", priority: "P2" },
  { refCode: "TASK-024", title: "API documentation",           priority: "P3" },
];
const TASKS_DONE = [
  { refCode: "TASK-001", title: "Auth system (JWT + sessions)", priority: "P0" },
  { refCode: "TASK-002", title: "Product catalogue CRUD",       priority: "P1" },
  { refCode: "TASK-003", title: "POS terminal UI",              priority: "P0" },
  { refCode: "TASK-004", title: "Sales dashboard",              priority: "P1" },
  { refCode: "TASK-005", title: "Receipt printing (PDF)",       priority: "P2" },
];

// ─── Design tokens — hardcoded to the app's CURRENT light-mode values ─────────
// This page must stay light regardless of the app's dark mode, so we mirror the
// resolved token values here rather than referencing CSS vars.

const C = {
  accent:        "#2962db",
  accentMuted:   "rgba(41,98,219,0.08)",
  surface:       "#ffffff",
  pageBg:        "#f6f6f7",
  cardFooter:    "#fafafa",
  border:        "rgba(0,0,0,0.07)",
  borderStrong:  "rgba(0,0,0,0.12)",
  borderFooter:  "rgba(0,0,0,0.06)",
  bgSubtle:      "rgba(0,0,0,0.02)",
  bgMuted:       "#e7e7ea",
  componentFill: "rgba(0,0,0,0.025)",
  fg:            "#09090b",
  fgSecondary:   "#52525b",
  fgMuted:       "#a1a1aa",
  fgDisabled:    "#d4d4d8",
  success:       "#16a34a",
  warning:       "#d97706",
  danger:        "#dc2626",
  radiusSm:      "6px",
  radiusMd:      "10px",
  radiusLg:      "12px",
} as const;

const T = {
  blue:  { fg: C.accent,  bg: C.accentMuted             },
  green: { fg: C.success, bg: "rgba(22,163,74,0.08)"    },
  amber: { fg: C.warning, bg: "rgba(217,119,6,0.08)"    },
  red:   { fg: C.danger,  bg: "rgba(220,38,38,0.08)"    },
  gray:  { fg: C.fgMuted, bg: C.componentFill           },
} as const;
type ToneKey = keyof typeof T;

const GRID = "rgba(0,0,0,0.05)";
const ZERO_BAR = C.bgMuted;

// ─── SVG charts ───────────────────────────────────────────────────────────────

// Generic bar chart — annotate=true adds "+N" labels above non-zero bars
function BarChart({ points, color, height = 56, annotate = false }: {
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
                fill={color} opacity={isLast ? 1 : 0.73}
                fontFamily="ui-monospace, monospace" fontWeight="600">+{v}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// Line chart with gradient area fill and halo end-dot
function LineChart({ points, color, height = 56 }: { points: number[]; color: string; height?: number }) {
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
      <circle cx={last.x} cy={last.y} r="1.2" fill={C.surface} />
    </svg>
  );
}

// Velocity chart — 4 weeks of daily bars with week bands, avg line, and week labels
function VelocityChart({ points, weeks, color }: {
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
        <rect key={i} x={i * weekW + 1} y={0} width={weekW - 2} height={chartH} fill={C.bgSubtle} />
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
      <rect x="2" y={avgY - 8} width="44" height="11" rx="2.5" fill={C.surface} />
      <text x="5" y={avgY + 1.5} fontSize="8.5" fill={color} fontFamily="ui-monospace, monospace" fontWeight="600" opacity="0.75">
        avg {avg.toFixed(1)}/day
      </text>

      {/* Week dividers */}
      {[1, 2, 3].map(i => (
        <line key={i} x1={i * weekW} y1="0" x2={i * weekW} y2={chartH}
          stroke={C.borderStrong} strokeWidth="0.75" />
      ))}

      {/* Bottom label row: week name + score */}
      {weeks.map((w, i) => {
        const pct = w.total > 0 ? w.done / w.total : 0;
        const scoreColor = pct >= 1 ? T.green.fg : pct >= 0.5 ? color : pct > 0 ? T.amber.fg : T.gray.fg;
        return (
          <g key={w.week}>
            <text x={i * weekW + 5} y={H - 3} fontSize="9" fill={C.fgMuted}
              fontFamily="ui-monospace, monospace" fontWeight="500">{w.week}</text>
            <text x={i * weekW + weekW - 5} y={H - 3} fontSize="9" fill={scoreColor}
              fontFamily="ui-monospace, monospace" fontWeight="600" textAnchor="end">{w.done}/{w.total}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── UI primitives ────────────────────────────────────────────────────────────

function Card({ children, className = "", style }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.radiusLg, ...style }}
    >
      {children}
    </div>
  );
}

function CardFooter({ children, className = "", style }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{ background: C.cardFooter, borderTop: `1px solid ${C.borderFooter}`, ...style }}
    >
      {children}
    </div>
  );
}

function RefCode({ code }: { code: string }) {
  return (
    <span
      className="font-mono text-[11px] px-1.5 py-0.5 rounded-md tracking-wide leading-none"
      style={{ background: C.accentMuted, color: C.accent }}
    >
      {code}
    </span>
  );
}

function KpiCard({ icon: Icon, label, value, sub, tone = "blue" }: {
  icon: LucideIcon; label: string; value: string; sub?: string; tone?: ToneKey;
}) {
  const t = T[tone];
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <SectionLabel>{label}</SectionLabel>
        <span
          className="size-7 rounded-[6px] flex items-center justify-center"
          style={{ background: t.bg, border: `1px solid ${C.border}`, outline: `1px solid ${C.border}`, outlineOffset: "2px" }}
        >
          <Icon size={13} strokeWidth={2} style={{ color: t.fg }} />
        </span>
      </div>
      <div className="text-[28px] font-semibold tabular-nums tracking-tight leading-none" style={{ color: C.fg }}>{value}</div>
      {sub && <div className="text-[12px] mt-1.5" style={{ color: C.fgMuted }}>{sub}</div>}
    </Card>
  );
}

function Badge({ label, tone }: { label: string; tone: ToneKey }) {
  const t = T[tone];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full leading-none tabular-nums"
      style={{ background: t.bg, color: t.fg }}>
      <span className="w-1 h-1 rounded-full shrink-0" style={{ background: t.fg }} aria-hidden />
      {label}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-semibold uppercase tracking-[0.1em]" style={{ color: C.fgMuted }}>{children}</span>;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function ShipLockWordmark() {
  return (
    <div className="flex items-center gap-2 px-4 pt-4 pb-0 mb-4">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="20" height="20" rx="5" fill="url(#sl-grad)" />
        <rect width="20" height="20" rx="5" fill="url(#sl-shine)" />
        <rect x="0.5" y="0.5" width="19" height="19" rx="4.5" stroke="rgba(0,0,0,0.22)" strokeWidth="1" />
        <path
          d="M10 4.5C8.343 4.5 7 5.843 7 7.5V8.5H6.5C6.224 8.5 6 8.724 6 9V14C6 14.552 6.448 15 7 15H13C13.552 15 14 14.552 14 14V9C14 8.724 13.776 8.5 13.5 8.5H13V7.5C13 5.843 11.657 4.5 10 4.5ZM10 5.75C10.966 5.75 11.75 6.534 11.75 7.5V8.5H8.25V7.5C8.25 6.534 9.034 5.75 10 5.75ZM10 10.5C10.552 10.5 11 10.948 11 11.5C11 11.894 10.776 12.234 10.448 12.41L10.75 13.5H9.25L9.552 12.41C9.224 12.234 9 11.894 9 11.5C9 10.948 9.448 10.5 10 10.5Z"
          fill="white"
        />
        <defs>
          <linearGradient id="sl-grad" x1="10" y1="0" x2="10" y2="20" gradientUnits="userSpaceOnUse">
            <stop stopColor="#3b7dff" />
            <stop offset="1" stopColor="#2962db" />
          </linearGradient>
          <linearGradient id="sl-shine" x1="10" y1="0" x2="10" y2="10" gradientUnits="userSpaceOnUse">
            <stop stopColor="white" stopOpacity="0.18" />
            <stop offset="1" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <span className="text-[14px] font-semibold tracking-[-0.01em]" style={{ color: C.fg }}>ShipLock</span>
    </div>
  );
}

function ProjectTile({ name, size = 26 }: { name: string; size?: number }) {
  const initials = name.split(/\s+/).slice(0, 2).map(w => w.charAt(0)).join("").toUpperCase();
  return (
    <span
      className="flex items-center justify-center shrink-0 font-bold text-white select-none"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.28),
        fontSize: Math.round(size * 0.42),
        letterSpacing: "0.02em",
        backgroundImage: "linear-gradient(180deg, rgba(255,255,255,0.25), rgba(255,255,255,0) 55%), linear-gradient(180deg, #3b7dff, #2962db)",
        boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.18)",
        textShadow: "0 1px 1px rgba(0,0,0,0.15)",
      }}
    >
      {initials}
    </span>
  );
}

const NAV_SECTIONS: { label: string | null; items: { key: string; label: string; Icon: LucideIcon }[] }[] = [
  { label: null,      items: [{ key: "dashboard", label: "Dashboard", Icon: LayoutDashboard }] },
  { label: "Deliver", items: [
    { key: "requirements", label: "Requirements", Icon: FileCheck },
    { key: "tasks",        label: "Tasks",        Icon: CheckSquare },
  ] },
  { label: "Protect", items: [
    { key: "scope-changes", label: "Scope Changes", Icon: GitBranch },
  ] },
];

function Sidebar({ active }: { active: string }) {
  return (
    <aside
      className="hidden sm:flex w-[230px] flex-col shrink-0 h-full"
      style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: C.radiusLg }}
    >
      <ShipLockWordmark />

      {/* Project switcher */}
      <div className="px-3">
        <div
          className="w-full flex items-center gap-2.5 p-2 rounded-[10px] text-left"
          style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 1px 2px rgba(0,0,0,0.05)" }}
        >
          <ProjectTile name={PROJECT.name} />
          <span className="flex flex-col min-w-0 flex-1 gap-[3px]">
            <span className="text-[12.5px] font-semibold truncate leading-none" style={{ color: C.fg }}>{PROJECT.name}</span>
            <span className="text-[10.5px] leading-none truncate" style={{ color: C.fgMuted }}>MVP · {PROJECT.deadline}</span>
          </span>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" className="shrink-0" style={{ color: C.fgDisabled }}>
            <path d="M5 6.5L8 3.5L11 6.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 9.5L8 12.5L11 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-8 pb-2 overflow-y-auto min-h-0">
        {NAV_SECTIONS.map((section, si) => (
          <div key={section.label ?? si} className={si > 0 ? "mt-4" : undefined}>
            {section.label && (
              <p className="px-2.5 mb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em]" style={{ color: C.fgMuted }}>
                {section.label}
              </p>
            )}
            <div className="flex flex-col gap-px">
              {section.items.map(({ key, label, Icon }) => {
                const isActive = key === active;
                return (
                  <div
                    key={key}
                    className="flex items-center gap-2 h-8 px-2.5 rounded-[6px] text-[13px] leading-none cursor-default"
                    style={{
                      background: isActive ? C.accentMuted : "transparent",
                      color: isActive ? C.accent : C.fgSecondary,
                      fontWeight: isActive ? 500 : 400,
                    }}
                  >
                    <Icon size={15} strokeWidth={2} className="shrink-0" style={{ color: isActive ? C.accent : C.fgMuted }} />
                    <span className="flex-1 truncate">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer — org identity */}
      <div className="px-3 pb-3 pt-1">
        <div className="flex items-center gap-2 px-2.5 py-1">
          <div
            className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
            style={{ background: C.accentMuted, color: C.accent }}
          >P</div>
          <span className="text-[11.5px] truncate flex-1" style={{ color: C.fgMuted }}>Praise&rsquo;s Studio</span>
        </div>
      </div>
    </aside>
  );
}

function PageHeader({ title, meta }: { title: string; meta?: string }) {
  return (
    <div className="flex items-center gap-2.5 min-h-8">
      <h1 className="text-[14px] font-semibold tracking-tight leading-none" style={{ color: C.fg }}>{title}</h1>
      {meta && <p className="text-[11.5px] tabular-nums leading-none mt-px" style={{ color: C.fgMuted }}>{meta}</p>}
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function DashboardSection() {
  const pending  = SCOPE_CHANGES.filter(c => c.status === "pending").length;
  const accepted = SCOPE_CHANGES.filter(c => c.status === "accepted").length;
  const rejected = SCOPE_CHANGES.filter(c => c.status === "rejected").length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={PROJECT.name} meta={`MVP · ${PROJECT.deadline}`} />

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard icon={TrendingUp}    label="Completion"    value={`${COMPLETION_PCT}%`}      sub="On track"             tone="blue" />
        <KpiCard icon={CheckCircle2}  label="Tasks done"    value={`${TASK_STATS.done}`}      sub={`of ${TASK_STATS.total}`} tone="green" />
        <KpiCard icon={AlertTriangle} label="Blocked"       value={`${TASK_STATS.blocked}`}   sub="Need action"          tone="red" />
        <KpiCard icon={GitBranch}     label="Scope changes" value={`${SCOPE_CHANGES.length}`} sub={`${pending} pending`} tone="amber" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[1fr_190px] gap-3">
        {/* Velocity card */}
        <Card className="p-5 flex flex-col">
          <div>
            <SectionLabel>Sprint velocity · 28d</SectionLabel>
            <p className="text-[10px] mt-0.5" style={{ color: C.fgMuted }}>Each bar = 1 day · grouped by week</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-[28px] font-semibold tabular-nums tracking-tight leading-none" style={{ color: C.fg }}>
                {TASK_STATS.done} tasks
              </span>
              <span className="text-[12px] mb-0.5" style={{ color: C.fgMuted }}>{COMPLETION_PCT}% of {TASK_STATS.total}</span>
            </div>
          </div>
          <div className="flex-1" />
          <div style={{ height: 96, overflow: "hidden" }}>
            <VelocityChart points={DAILY_VELOCITY} weeks={WEEK_DATA} color={T.blue.fg} />
          </div>
        </Card>

        {/* Scope creep card — grey footer strip */}
        <Card className="overflow-hidden flex flex-col">
          <div className="p-4 flex flex-col flex-1">
            <SectionLabel>Scope creep · 7d</SectionLabel>
            <p className="text-[10px] mt-0.5" style={{ color: C.fgMuted }}>Each bar = 1 day</p>
            <div className="mt-2.5">
              <span className="text-[28px] font-semibold tabular-nums tracking-tight leading-none" style={{ color: C.fg }}>
                +{SCOPE_CHANGES.length}
              </span>
              <p className="text-[11px] mt-0.5" style={{ color: C.fgMuted }}>items added</p>
            </div>
            <div className="flex-1" />
            <div style={{ height: 56, overflow: "hidden" }}>
              <BarChart points={DAILY_SCOPE.slice(-7)} color={T.red.fg} height={56} annotate />
            </div>
          </div>

          <CardFooter className="px-4 py-3 flex flex-col gap-2">
            {([
              { label: "Pending",  n: pending,  tone: "amber" as ToneKey },
              { label: "Accepted", n: accepted, tone: "green" as ToneKey },
              { label: "Rejected", n: rejected, tone: "red"   as ToneKey },
            ]).map(r => (
              <div key={r.label} className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: C.fgSecondary }}>{r.label}</span>
                <Badge label={`${r.n}`} tone={r.tone} />
              </div>
            ))}
          </CardFooter>
        </Card>
      </div>

      {/* Blocked */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <SectionLabel>Blocked — needs action</SectionLabel>
          <span className="text-[11px] font-semibold tabular-nums" style={{ color: T.red.fg }}>{BLOCKED_ITEMS.length} open</span>
        </div>
        <div className="flex flex-col gap-2">
          {BLOCKED_ITEMS.map(item => (
            <Card key={item.refCode} className="p-4 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <RefCode code={item.refCode} />
                  <Badge label={item.critical ? "Critical" : "Warning"} tone={item.critical ? "red" : "amber"} />
                </div>
                <p className="text-[13.5px] font-medium" style={{ color: C.fg }}>{item.title}</p>
                <p className="text-[12px] mt-0.5" style={{ color: C.fgMuted }}>↳ {item.blockedBy}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-[13px] font-semibold tabular-nums" style={{ color: item.critical ? T.red.fg : T.amber.fg }}>
                  {item.elapsed}
                </div>
                <div className="text-[10px] mt-0.5" style={{ color: C.fgMuted }}>updated</div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Scope Changes ────────────────────────────────────────────────────────────

function ScopeChangesSection() {
  const total = SCOPE_CHANGES.length;
  const counts = {
    pending:  SCOPE_CHANGES.filter(c => c.status === "pending").length,
    accepted: SCOPE_CHANGES.filter(c => c.status === "accepted").length,
    rejected: SCOPE_CHANGES.filter(c => c.status === "rejected").length,
    deferred: SCOPE_CHANGES.filter(c => c.status === "deferred").length,
  };
  const stTone:  Record<string, ToneKey> = { pending: "amber", accepted: "green", rejected: "red", deferred: "gray" };
  const impTone: Record<string, ToneKey> = { high: "red", medium: "amber", low: "green" };
  const daysWithScope = DAILY_SCOPE.filter(Boolean).length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Scope Changes" meta={`${total} total · ${counts.pending} pending`} />

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard icon={GitBranch}     label="Total"    value={`${total}`}           sub="Changes logged" tone="blue" />
        <KpiCard icon={Clock}         label="Pending"  value={`${counts.pending}`}  sub="Need decision"  tone="amber" />
        <KpiCard icon={CheckCircle2}  label="Accepted" value={`${counts.accepted}`} sub="Approved"       tone="green" />
        <KpiCard icon={AlertTriangle} label="Rejected" value={`${counts.rejected}`} sub="Declined"       tone="red" />
      </div>

      {/* Status breakdown */}
      <Card className="p-5">
        <SectionLabel>Status breakdown</SectionLabel>
        <div className="h-2.5 rounded-full overflow-hidden flex gap-px my-4" style={{ background: C.bgMuted }}>
          {(["pending","accepted","rejected","deferred"] as const).map(k => counts[k] > 0 && (
            <div key={k} className="h-full" style={{ width: `${(counts[k] / total) * 100}%`, background: T[stTone[k]].fg }} />
          ))}
        </div>
        <div className="grid grid-cols-4 gap-3">
          {(["pending","accepted","rejected","deferred"] as const).map(k => (
            <div key={k} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full" style={{ background: T[stTone[k]].fg }} />
                <span className="text-[11px] capitalize" style={{ color: C.fgSecondary }}>{k}</span>
              </div>
              <span className="text-[22px] font-semibold tabular-nums tracking-tight leading-none" style={{ color: C.fg }}>{counts[k]}</span>
              <span className="text-[11px] tabular-nums" style={{ color: C.fgMuted }}>{Math.round((counts[k] / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Creep trend */}
      <Card className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <SectionLabel>Creep trend · 14d</SectionLabel>
            <p className="text-[10px] mt-0.5" style={{ color: C.fgMuted }}>Each bar = 1 day · height = items added</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-[24px] font-semibold tabular-nums tracking-tight leading-none" style={{ color: C.fg }}>
                +{daysWithScope}
              </span>
              <span className="text-[12px] mb-0.5" style={{ color: C.fgMuted }}>days with new scope</span>
            </div>
          </div>
        </div>
        <div style={{ height: 68, overflow: "hidden" }}>
          <BarChart points={DAILY_SCOPE} color={T.red.fg} height={68} annotate />
        </div>
      </Card>

      {/* Change cards */}
      <div>
        <SectionLabel>All changes</SectionLabel>
        <div className="mt-2.5 flex flex-col gap-2">
          {SCOPE_CHANGES.map(ch => (
            <Card key={ch.id} className="p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge label={ch.status.charAt(0).toUpperCase() + ch.status.slice(1)} tone={stTone[ch.status] ?? "gray"} />
                  <Badge label={`${ch.impact} impact`} tone={impTone[ch.impact] ?? "gray"} />
                </div>
                {ch.est != null && (
                  <span className="text-[12px] font-mono font-medium shrink-0 tabular-nums" style={{ color: C.fgSecondary }}>+{ch.est}d</span>
                )}
              </div>
              <p className="text-[13.5px] font-medium mb-1" style={{ color: C.fg }}>{ch.title}</p>
              <p className="text-[12px] leading-relaxed" style={{ color: C.fgSecondary }}>{ch.description}</p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mt-2" style={{ color: C.fgMuted }}>Via {ch.source}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Requirements ─────────────────────────────────────────────────────────────

function RequirementsSection() {
  const total = REQUIREMENTS.length;
  const counts = {
    approved: REQUIREMENTS.filter(r => r.status === "approved").length,
    pending:  REQUIREMENTS.filter(r => r.status === "pending_approval").length,
    draft:    REQUIREMENTS.filter(r => r.status === "draft").length,
    disputed: REQUIREMENTS.filter(r => r.status === "disputed").length,
    mvp:      REQUIREMENTS.filter(r => r.cls === "mvp").length,
  };
  const approvalPct   = Math.round((counts.approved / total) * 100);
  const approvalTrend = [0,0,1,2,3,3,3,4,4,5,5,5,5,5];

  const clsTone:  Record<string, ToneKey> = { mvp: "blue", post_mvp: "gray", out_of_scope: "red" };
  const stTone:   Record<string, ToneKey> = { draft: "gray", pending_approval: "amber", approved: "green", disputed: "red" };
  const stLabel:  Record<string, string>  = { draft: "Draft", pending_approval: "Pending", approved: "Approved", disputed: "Disputed" };
  const clsLabel: Record<string, string>  = { mvp: "MVP", post_mvp: "Post-MVP", out_of_scope: "Out of scope" };

  const metaRows = [
    { k: "approved", l: "Approved", t: "green" as ToneKey },
    { k: "pending",  l: "Pending",  t: "amber" as ToneKey },
    { k: "draft",    l: "Draft",    t: "gray"  as ToneKey },
    { k: "disputed", l: "Disputed", t: "red"   as ToneKey },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Requirements" meta={`${total} total · ${approvalPct}% approved`} />

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard icon={Layers}        label="MVP scope" value={`${counts.mvp}`}       sub={`of ${total}`}   tone="blue" />
        <KpiCard icon={CheckCircle2}  label="Approved"  value={`${counts.approved}`}  sub="Client-signed"   tone="green" />
        <KpiCard icon={Clock}         label="Pending"   value={`${counts.pending}`}   sub="Awaiting client" tone="amber" />
        <KpiCard icon={AlertTriangle} label="Disputed"  value={`${counts.disputed}`}  sub="Conflict"        tone="red" />
      </div>

      {/* Approval overview — grey footer strip */}
      <Card className="overflow-hidden">
        <div className="p-5">
          <div className="mb-3">
            <SectionLabel>Approval rate</SectionLabel>
            <p className="text-[10px] mt-0.5" style={{ color: C.fgMuted }}>Running total of approved requirements over time</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-[28px] font-semibold tabular-nums tracking-tight leading-none" style={{ color: C.fg }}>{approvalPct}%</span>
              <span className="text-[12px] mb-0.5" style={{ color: C.fgMuted }}>client-approved</span>
            </div>
          </div>
          <div style={{ height: 64, overflow: "hidden" }}>
            <LineChart points={approvalTrend} color={T.green.fg} height={64} />
          </div>
        </div>
        <CardFooter className="grid grid-cols-4 gap-3 px-5 py-4">
          {metaRows.map(r => (
            <div key={r.k}>
              <div className="text-[20px] font-semibold tabular-nums tracking-tight leading-none mb-1.5" style={{ color: C.fg }}>
                {counts[r.k as keyof typeof counts]}
              </div>
              <Badge label={r.l} tone={r.t} />
            </div>
          ))}
        </CardFooter>
      </Card>

      {/* Table */}
      <div>
        <SectionLabel>All requirements</SectionLabel>
        <Card className="mt-2.5 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr style={{ background: C.cardFooter, borderBottom: `1px solid ${C.borderFooter}` }}>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: C.fgMuted }}>Ref</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: C.fgMuted }}>Requirement</th>
                <th className="hidden sm:table-cell text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: C.fgMuted }}>Scope</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: C.fgMuted }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {REQUIREMENTS.map(req => (
                <tr key={req.refCode} style={{ borderTop: `1px solid ${C.border}` }}>
                  <td className="px-4 py-3"><RefCode code={req.refCode} /></td>
                  <td className="px-4 py-3 text-[12.5px] font-medium" style={{ color: C.fg }}>{req.title}</td>
                  <td className="hidden sm:table-cell px-4 py-3">
                    <Badge label={clsLabel[req.cls]} tone={clsTone[req.cls] ?? "gray"} />
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      label={req.auto ? "Auto-approved" : stLabel[req.status] ?? req.status}
                      tone={req.auto ? "green" : (stTone[req.status] ?? "gray")}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

function TasksSection() {
  const completionTrend = [8,8,9,10,11,11,11,12,12,13,13,14,14,14];
  const pTone: Record<string, ToneKey> = { P0: "red", P1: "amber", P2: "blue", P3: "gray" };

  const queueCards = TASKS_QUEUE.map(t => ({ ...t, status: "not_started", blockedBy: null as string | null }));
  const doneCards  = TASKS_DONE.map(t  => ({ ...t, status: "done",        blockedBy: null as string | null }));

  const columns = [
    { key: "attention", label: "Needs Attention", tasks: TASKS_ATTENTION, tone: "red"   as ToneKey },
    { key: "queue",     label: "Queue",           tasks: queueCards,      tone: "gray"  as ToneKey },
    { key: "done",      label: "Finished",        tasks: doneCards,       tone: "green" as ToneKey },
  ];

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title="Tasks" meta={`${TASK_STATS.done}/${TASK_STATS.total} complete · ${COMPLETION_PCT}%`} />

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard icon={CheckCircle2}  label="Done"        value={`${TASK_STATS.done}`}        sub="Shipped"       tone="green" />
        <KpiCard icon={TrendingUp}    label="In progress" value={`${TASK_STATS.inProgress}`}  sub="Active"        tone="blue" />
        <KpiCard icon={AlertTriangle} label="Blocked"     value={`${TASK_STATS.blocked}`}     sub="Action needed" tone="red" />
        <KpiCard icon={Clock}         label="Not started" value={`${TASK_STATS.notStarted}`}  sub="Queued"        tone="gray" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="p-5">
          <SectionLabel>Completion trend · 14d</SectionLabel>
          <p className="text-[10px] mt-0.5" style={{ color: C.fgMuted }}>Cumulative tasks done over time</p>
          <div className="flex items-end gap-2 mt-2 mb-3">
            <span className="text-[28px] font-semibold tabular-nums tracking-tight leading-none" style={{ color: C.fg }}>
              {TASK_STATS.done}
            </span>
            <span className="text-[12px] mb-0.5" style={{ color: C.fgMuted }}>tasks · {COMPLETION_PCT}%</span>
          </div>
          <div style={{ height: 72, overflow: "hidden" }}>
            <LineChart points={completionTrend} color={T.green.fg} height={72} />
          </div>
        </Card>
        <Card className="p-5">
          <SectionLabel>Daily velocity · 28d</SectionLabel>
          <p className="text-[10px] mt-0.5" style={{ color: C.fgMuted }}>Each bar = 1 day · recent = darker</p>
          <div className="flex items-end gap-2 mt-2 mb-3">
            <span className="text-[28px] font-semibold tabular-nums tracking-tight leading-none" style={{ color: C.fg }}>
              {DAILY_VELOCITY.reduce((a, b) => a + b, 0)}
            </span>
            <span className="text-[12px] mb-0.5" style={{ color: C.fgMuted }}>tasks shipped</span>
          </div>
          <div style={{ height: 72, overflow: "hidden" }}>
            <BarChart points={DAILY_VELOCITY} color={T.blue.fg} height={72} />
          </div>
        </Card>
      </div>

      {/* Kanban */}
      <div>
        <SectionLabel>Board</SectionLabel>
        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
          {columns.map(col => (
            <Card key={col.key} className="overflow-hidden">
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ background: C.cardFooter, borderBottom: `1px solid ${C.borderFooter}` }}
              >
                <Badge label={col.label} tone={col.tone} />
                <span className="text-[11px] font-mono tabular-nums" style={{ color: C.fgMuted }}>{col.tasks.length}</span>
              </div>
              <div className="p-3 flex flex-col gap-2">
                {col.tasks.map(task => (
                  <div
                    key={task.refCode}
                    className="block p-3 rounded-[10px]"
                    style={{ border: `1px solid ${C.border}`, background: C.bgSubtle }}
                  >
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <RefCode code={task.refCode} />
                      <Badge label={task.priority} tone={pTone[task.priority] ?? "gray"} />
                    </div>
                    <p className="text-[12.5px] font-medium leading-snug" style={{ color: C.fg }}>{task.title}</p>
                    {task.blockedBy && (
                      <p className="text-[11px] mt-1.5" style={{ color: T.red.fg }}>↳ {task.blockedBy}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PreviewPageProps {
  searchParams: Promise<{ section?: string }>;
}

export default async function PreviewPage({ searchParams }: PreviewPageProps) {
  const { section = "tasks" } = await searchParams;

  const content: Record<string, React.ReactNode> = {
    dashboard:       <DashboardSection />,
    "scope-changes": <ScopeChangesSection />,
    requirements:    <RequirementsSection />,
    tasks:           <TasksSection />,
  };

  return (
    <div className="flex overflow-hidden gap-3 p-3" style={{ height: "100vh", background: C.pageBg }}>
      <Sidebar active={section} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex-1 overflow-auto">
          <div className="w-full max-w-[1100px] mx-auto px-2 sm:px-6 py-4">
            {content[section] ?? content.dashboard}
          </div>
        </div>
      </div>
    </div>
  );
}
