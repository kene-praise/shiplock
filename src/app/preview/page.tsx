import {
  LayoutDashboard, GitBranch, FileCheck, CheckSquare,
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
  { id: "1", title: "Add loyalty points engine",   source: "Client",      status: "pending",  impact: "medium", createdAt: "1d ago", description: "Points-per-purchase system with redemption at checkout. Est. 3–4 days." },
  { id: "2", title: "Bulk product import via CSV", source: "Stakeholder", status: "accepted", impact: "low",    createdAt: "3d ago", description: "Allow staff to upload a CSV of products. Est. 1 day." },
  { id: "3", title: "Multi-currency pricing",      source: "Client",      status: "rejected", impact: "high",   createdAt: "5d ago", description: "USD and GBP alongside NGN. Requires exchange-rate API + tax recalcs." },
  { id: "4", title: "WhatsApp receipt delivery",   source: "Client",      status: "deferred", impact: "low",    createdAt: "6d ago", description: "Send receipts via WhatsApp Business API instead of SMS only." },
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

// ─── Design tokens ────────────────────────────────────────────────────────────

const T = {
  blue:  { fg: "#2b7fff", bg: "rgba(43,127,255,0.09)"  },
  green: { fg: "#16a34a", bg: "rgba(22,163,74,0.10)"   },
  amber: { fg: "#d97706", bg: "rgba(217,119,6,0.10)"   },
  red:   { fg: "#dc2626", bg: "rgba(220,38,38,0.10)"   },
  gray:  { fg: "#6b7280", bg: "#f3f4f6"                },
} as const;
type ToneKey = keyof typeof T;

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
          stroke="rgba(0,0,0,0.05)" strokeWidth="0.75" />
      ))}
      {points.map((v, i) => {
        const bh   = v === 0 ? 2 : Math.max(5, (v / max) * (H - 10));
        const x    = i * gap + (gap - bw) / 2;
        const isLast = i === points.length - 1;
        const fill = v === 0 ? "rgba(0,0,0,0.07)" : isLast ? color : `${color}80`;
        return (
          <g key={i}>
            <rect x={x} y={H - bh} width={bw} height={bh} rx="2" fill={fill} />
            {annotate && v > 0 && (
              <text x={x + bw / 2} y={H - bh - 3} textAnchor="middle" fontSize="7.5"
                fill={isLast ? color : `${color}bb`} fontFamily="system-ui" fontWeight="700">+{v}</text>
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
          stroke="rgba(0,0,0,0.05)" strokeWidth="0.75" />
      ))}
      <path d={`${pathD} L${W},${H} L0,${H} Z`} fill={`url(#${uid})`} />
      <path d={pathD} fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last.x} cy={last.y} r="5.5" fill={color} opacity="0.15" />
      <circle cx={last.x} cy={last.y} r="2.75" fill={color} />
      <circle cx={last.x} cy={last.y} r="1.2" fill="white" />
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
        <rect key={i} x={i * weekW + 1} y={0} width={weekW - 2} height={chartH} fill="rgba(0,0,0,0.018)" />
      ))}

      {/* Grid lines */}
      {[0.33, 0.67, 1].map(p => (
        <line key={p} x1="0" y1={chartH - (chartH - 10) * p - 5} x2={W} y2={chartH - (chartH - 10) * p - 5}
          stroke="rgba(0,0,0,0.05)" strokeWidth="0.75" />
      ))}

      {/* Bars */}
      {points.map((v, i) => {
        const weekIdx = Math.floor(i / 7);
        const bh  = v === 0 ? 2 : Math.max(6, (v / max) * (chartH - 10));
        const x   = i * dayW + (dayW - bw) / 2;
        const fill = v === 0 ? "rgba(0,0,0,0.07)" : color;
        const op   = v === 0 ? 1 : weekOpacity[weekIdx];
        return <rect key={i} x={x} y={chartH - bh} width={bw} height={bh} rx="2.5" fill={fill} opacity={op} />;
      })}

      {/* Average dashed line */}
      <line x1="0" y1={avgY} x2={W * 0.72} y2={avgY} stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.3" />
      <rect x="2" y={avgY - 8} width="44" height="11" rx="2.5" fill="white" />
      <text x="5" y={avgY + 1.5} fontSize="8.5" fill={color} fontFamily="system-ui, -apple-system" fontWeight="600" opacity="0.65">
        avg {avg.toFixed(1)}/day
      </text>

      {/* Week dividers */}
      {[1, 2, 3].map(i => (
        <line key={i} x1={i * weekW} y1="0" x2={i * weekW} y2={chartH}
          stroke="rgba(0,0,0,0.09)" strokeWidth="0.75" />
      ))}

      {/* Bottom label row: week name + score */}
      {weeks.map((w, i) => {
        const pct = w.done / w.total;
        const scoreColor = pct >= 1 ? T.green.fg : pct >= 0.5 ? color : pct > 0 ? T.amber.fg : T.gray.fg;
        return (
          <g key={w.week}>
            <text x={i * weekW + 5} y={H - 3} fontSize="9" fill="rgba(0,0,0,0.28)"
              fontFamily="system-ui" fontWeight="600">{w.week}</text>
            <text x={i * weekW + weekW - 5} y={H - 3} fontSize="9" fill={scoreColor}
              fontFamily="system-ui" fontWeight="700" textAnchor="end">{w.done}/{w.total}</text>
          </g>
        );
      })}
    </svg>
  );
}

function DonutRing({ pct, color, size = 72 }: { pct: number; color: string; size?: number }) {
  const r = size / 2 - 9, c = size / 2, circ = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={c} cy={c} r={r} fill="none" stroke="#F3F4F6" strokeWidth="7" />
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${(pct / 100) * circ} ${circ}`}
        strokeLinecap="round" transform={`rotate(-90 ${c} ${c})`} />
      <text x={c} y={c + 5} textAnchor="middle" fontSize="13" fontWeight="600" fill="#111827">{pct}%</text>
    </svg>
  );
}

// Multi-segment donut for scope breakdown
function ScopeDonut({ segments, size = 48 }: {
  segments: { n: number; color: string }[];
  size?: number;
}) {
  const total = Math.max(1, segments.reduce((s, c) => s + c.n, 0));
  const r = size / 2 - 7, cx = size / 2, cy = size / 2;
  const toXY = (deg: number) => ({
    x: cx + r * Math.cos(((deg - 90) * Math.PI) / 180),
    y: cy + r * Math.sin(((deg - 90) * Math.PI) / 180),
  });
  let startDeg = 0;
  const arcs = segments.filter(s => s.n > 0).map(s => {
    const sweep = (s.n / total) * 360;
    const endDeg = startDeg + sweep - 2;
    const { x: x1, y: y1 } = toXY(startDeg);
    const { x: x2, y: y2 } = toXY(endDeg);
    const large = sweep > 180 ? 1 : 0;
    const d = `M${x1.toFixed(2)},${y1.toFixed(2)} A${r},${r} 0 ${large},1 ${x2.toFixed(2)},${y2.toFixed(2)}`;
    startDeg += sweep;
    return { d, color: s.color };
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F3F4F6" strokeWidth="6" />
      {arcs.map((arc, i) => (
        <path key={i} d={arc.d} fill="none" stroke={arc.color} strokeWidth="6" strokeLinecap="butt" />
      ))}
      <text x={cx} y={cy + 1} textAnchor="middle" fontSize="11" fontWeight="600" fill="#111827" dominantBaseline="middle">{total}</text>
    </svg>
  );
}

// ─── UI primitives ────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, sub, tone = "blue" }: {
  icon: LucideIcon; label: string; value: string; sub?: string; tone?: ToneKey;
}) {
  const t = T[tone];
  return (
    <div className="bg-white ring-1 ring-black/[0.06] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">{label}</span>
        <div className="size-7 rounded-lg flex items-center justify-center" style={{ background: t.bg }}>
          <Icon size={13} strokeWidth={2} style={{ color: t.fg }} />
        </div>
      </div>
      <div className="text-[28px] font-semibold tabular-nums tracking-tight text-gray-900 leading-none">{value}</div>
      {sub && <div className="text-[12px] text-gray-400 mt-1.5">{sub}</div>}
    </div>
  );
}

function Badge({ label, tone }: { label: string; tone: ToneKey }) {
  const t = T[tone];
  return (
    <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-md"
      style={{ background: t.bg, color: t.fg }}>
      {label}
    </span>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-400">{children}</span>;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "dashboard",     label: "Dashboard",     Icon: LayoutDashboard },
  { key: "scope-changes", label: "Scope Changes", Icon: GitBranch },
  { key: "requirements",  label: "Requirements",  Icon: FileCheck },
  { key: "tasks",         label: "Tasks",         Icon: CheckSquare },
];

function Sidebar({ active }: { active: string }) {
  return (
    <aside className="hidden sm:flex w-[200px] flex-col bg-white border-r border-gray-100 h-full shrink-0">
      <div className="px-5 py-5">
        <span className="text-[16px] font-semibold tracking-tight text-gray-900"
          style={{ fontFamily: '-apple-system, "SF Pro Display", system-ui, sans-serif' }}>
          ShipLock
        </span>
      </div>
      <nav className="flex-1 flex flex-col px-3 py-4 gap-0.5 min-h-0">
        <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gray-400 px-3 mb-1.5">Project</span>
        {NAV.map(({ key, label, Icon }) => {
          const isActive = key === active;
          return (
            <div key={key}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-default"
              style={{ background: isActive ? T.blue.bg : "transparent", color: isActive ? T.blue.fg : "#6b7280" }}>
              <Icon size={14} strokeWidth={isActive ? 2.25 : 2} />
              <span className={`text-[13px] ${isActive ? "font-semibold" : "font-medium"}`}>{label}</span>
            </div>
          );
        })}
      </nav>
      <div className="px-5 py-4 border-t border-gray-100">
        <div className="text-[12px] font-semibold text-gray-900 truncate">{PROJECT.name}</div>
        <div className="text-[11px] text-gray-400 mt-0.5">MVP · {PROJECT.deadline}</div>
      </div>
    </aside>
  );
}

function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className="flex-shrink-0 flex items-center justify-between bg-white border-b border-gray-100 px-5 py-3.5">
      <div>
        <h1 className="text-[14px] font-semibold text-gray-900">{title}</h1>
        {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
      </div>
      <div className="size-8 rounded-full bg-blue-50 flex items-center justify-center text-[13px] font-semibold"
        style={{ color: T.blue.fg }}>P</div>
    </header>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function DashboardSection() {
  const pending  = SCOPE_CHANGES.filter(c => c.status === "pending").length;
  const accepted = SCOPE_CHANGES.filter(c => c.status === "accepted").length;
  const rejected = SCOPE_CHANGES.filter(c => c.status === "rejected").length;
  const deferred = SCOPE_CHANGES.filter(c => c.status === "deferred").length;

  return (
    <>
      <PageHeader title="Dashboard" sub={PROJECT.name} />
      <div className="flex-1 overflow-auto p-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard icon={TrendingUp}    label="Completion"    value={`${COMPLETION_PCT}%`}      sub="On track"             tone="blue" />
          <KpiCard icon={CheckCircle2}  label="Tasks done"    value={`${TASK_STATS.done}`}      sub={`of ${TASK_STATS.total}`} tone="green" />
          <KpiCard icon={AlertTriangle} label="Blocked"       value={`${TASK_STATS.blocked}`}   sub="Need action"          tone="red" />
          <KpiCard icon={GitBranch}     label="Scope changes" value={`${SCOPE_CHANGES.length}`} sub={`${pending} pending`} tone="amber" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr_176px] gap-3">
          {/* Velocity card */}
          <div className="bg-white ring-1 ring-black/[0.06] rounded-xl p-5 flex flex-col">
            <div>
              <SectionLabel>Sprint velocity · 28d</SectionLabel>
              <p className="text-[10px] text-gray-400 mt-0.5">Each bar = 1 day · grouped by week</p>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-[28px] font-semibold tabular-nums tracking-tight text-gray-900 leading-none">
                  {TASK_STATS.done} tasks
                </span>
                <span className="text-[12px] text-gray-400 mb-0.5">{COMPLETION_PCT}% of {TASK_STATS.total}</span>
              </div>
            </div>
            <div className="flex-1" />
            <div style={{ height: 96, overflow: "hidden" }}>
              <VelocityChart points={DAILY_VELOCITY} weeks={WEEK_DATA} color={T.blue.fg} />
            </div>
          </div>

          {/* Scope creep card */}
          <div className="bg-white ring-1 ring-black/[0.06] rounded-xl p-4 flex flex-col">
            {/* Top: headings */}
            <div>
              <SectionLabel>Scope creep · 7d</SectionLabel>
              <p className="text-[10px] text-gray-400 mt-0.5">Each bar = 1 day</p>
              <div className="mt-2.5">
                <span className="text-[28px] font-semibold tabular-nums tracking-tight text-gray-900 leading-none">
                  +{SCOPE_CHANGES.length}
                </span>
                <p className="text-[11px] text-gray-400 mt-0.5">items added</p>
              </div>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Bar chart */}
            <div className="mb-3" style={{ height: 56, overflow: "hidden" }}>
              <BarChart points={DAILY_SCOPE.slice(-7)} color={T.red.fg} height={56} annotate />
            </div>

            {/* Badge rows */}
            <div className="pt-3 border-t border-gray-100 flex flex-col gap-2">
              {([
                { label: "Pending",  n: pending,  tone: "amber" as ToneKey },
                { label: "Accepted", n: accepted, tone: "green" as ToneKey },
                { label: "Rejected", n: rejected, tone: "red"   as ToneKey },
              ]).map(r => (
                <div key={r.label} className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">{r.label}</span>
                  <Badge label={`${r.n}`} tone={r.tone} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Blocked */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <SectionLabel>Blocked — needs action</SectionLabel>
            <span className="text-[11px] font-semibold" style={{ color: T.red.fg }}>{BLOCKED_ITEMS.length} open</span>
          </div>
          <div className="flex flex-col gap-2">
            {BLOCKED_ITEMS.map(item => (
              <div key={item.refCode} className="bg-white ring-1 ring-black/[0.06] rounded-xl p-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="font-mono text-[10px] text-gray-400">{item.refCode}</span>
                    <Badge label={item.critical ? "Critical" : "Warning"} tone={item.critical ? "red" : "amber"} />
                  </div>
                  <p className="text-[13.5px] font-semibold text-gray-900">{item.title}</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">↳ {item.blockedBy}</p>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[15px] font-semibold tabular-nums" style={{ color: item.critical ? T.red.fg : T.amber.fg }}>
                    {item.elapsed}
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">elapsed</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
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

  return (
    <>
      <PageHeader title="Scope Changes" sub={`${total} total · ${counts.pending} pending`} />
      <div className="flex-1 overflow-auto p-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard icon={GitBranch}     label="Total"    value={`${total}`}           sub="Changes logged" tone="blue" />
          <KpiCard icon={Clock}         label="Pending"  value={`${counts.pending}`}  sub="Need decision"  tone="amber" />
          <KpiCard icon={CheckCircle2}  label="Accepted" value={`${counts.accepted}`} sub="Approved"       tone="green" />
          <KpiCard icon={AlertTriangle} label="Rejected" value={`${counts.rejected}`} sub="Declined"       tone="red" />
        </div>

        {/* Status breakdown */}
        <div className="bg-white ring-1 ring-black/[0.06] rounded-xl p-5">
          <SectionLabel>Status breakdown</SectionLabel>
          <div className="h-2.5 rounded-full overflow-hidden flex gap-px my-4">
            {(["pending","accepted","rejected","deferred"] as const).map(k => counts[k] > 0 && (
              <div key={k} className="h-full" style={{ width: `${(counts[k] / total) * 100}%`, background: T[stTone[k]].fg }} />
            ))}
          </div>
          <div className="grid grid-cols-4 gap-3">
            {(["pending","accepted","rejected","deferred"] as const).map(k => (
              <div key={k} className="flex flex-col gap-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="size-2 rounded-full" style={{ background: T[stTone[k]].fg }} />
                  <span className="text-[11px] text-gray-500 capitalize">{k}</span>
                </div>
                <span className="text-[22px] font-semibold tabular-nums tracking-tight text-gray-900 leading-none">{counts[k]}</span>
                <span className="text-[11px] text-gray-400">{Math.round((counts[k] / total) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Creep trend */}
        <div className="bg-white ring-1 ring-black/[0.06] rounded-xl p-5">
          <div className="flex items-start justify-between mb-3">
            <div>
              <SectionLabel>Creep trend · 14d</SectionLabel>
              <p className="text-[10px] text-gray-400 mt-0.5">Each bar = 1 day · height = items added</p>
              <div className="flex items-end gap-2 mt-2">
                <span className="text-[24px] font-semibold tabular-nums tracking-tight text-gray-900 leading-none">
                  +{DAILY_SCOPE.filter(Boolean).length}
                </span>
                <span className="text-[12px] text-gray-400 mb-0.5">days with new scope</span>
              </div>
            </div>
            <Badge label="Scope grew 300%" tone="red" />
          </div>
          <div style={{ height: 68, overflow: "hidden" }}>
            <BarChart points={DAILY_SCOPE} color={T.red.fg} height={68} annotate />
          </div>
        </div>

        {/* Change cards */}
        <div>
          <SectionLabel>All changes</SectionLabel>
          <div className="mt-2.5 flex flex-col gap-2">
            {SCOPE_CHANGES.map(ch => (
              <div key={ch.id} className="bg-white ring-1 ring-black/[0.06] rounded-xl p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge label={ch.status.charAt(0).toUpperCase() + ch.status.slice(1)} tone={stTone[ch.status] ?? "gray"} />
                    <Badge label={`${ch.impact} impact`} tone={impTone[ch.impact] ?? "gray"} />
                  </div>
                  <span className="text-[11px] text-gray-400 shrink-0">{ch.createdAt}</span>
                </div>
                <p className="text-[13.5px] font-semibold text-gray-900 mb-1">{ch.title}</p>
                <p className="text-[12px] text-gray-500 leading-relaxed">{ch.description}</p>
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-[0.08em] mt-2">Via {ch.source}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
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
  const approvalPct  = Math.round((counts.approved / total) * 100);
  const approvalTrend = [0,0,1,2,3,3,3,4,4,5,5,5,5,5];

  const clsTone:  Record<string, ToneKey>  = { mvp: "blue", post_mvp: "gray", out_of_scope: "red" };
  const stTone:   Record<string, ToneKey>  = { draft: "gray", pending_approval: "amber", approved: "green", disputed: "red" };
  const stLabel:  Record<string, string>   = { draft: "Draft", pending_approval: "Pending", approved: "Approved", disputed: "Disputed" };
  const clsLabel: Record<string, string>   = { mvp: "MVP", post_mvp: "Post-MVP", out_of_scope: "Out of scope" };

  const metaRows = [
    { k: "approved", l: "Approved", t: "green" as ToneKey },
    { k: "pending",  l: "Pending",  t: "amber" as ToneKey },
    { k: "draft",    l: "Draft",    t: "gray"  as ToneKey },
    { k: "disputed", l: "Disputed", t: "red"   as ToneKey },
  ];

  return (
    <>
      <PageHeader title="Requirements" sub={`${total} total · ${approvalPct}% approved`} />
      <div className="flex-1 overflow-auto p-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard icon={Layers}        label="MVP scope" value={`${counts.mvp}`}       sub={`of ${total}`}   tone="blue" />
          <KpiCard icon={CheckCircle2}  label="Approved"  value={`${counts.approved}`}  sub="Client-signed"   tone="green" />
          <KpiCard icon={Clock}         label="Pending"   value={`${counts.pending}`}   sub="Awaiting client" tone="amber" />
          <KpiCard icon={AlertTriangle} label="Disputed"  value={`${counts.disputed}`}  sub="Conflict"        tone="red" />
        </div>

        {/* Approval overview */}
        <div className="bg-white ring-1 ring-black/[0.06] rounded-xl p-5">
          <div className="mb-3">
            <SectionLabel>Approval rate</SectionLabel>
            <p className="text-[10px] text-gray-400 mt-0.5">Running total of approved requirements over time</p>
            <div className="flex items-end gap-2 mt-2">
              <span className="text-[28px] font-semibold tabular-nums tracking-tight text-gray-900 leading-none">
                {approvalPct}%
              </span>
              <span className="text-[12px] text-gray-400 mb-0.5">client-approved</span>
            </div>
          </div>
          <div style={{ height: 64, overflow: "hidden" }}>
            <LineChart points={approvalTrend} color={T.green.fg} height={64} />
          </div>
          <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-gray-100">
            {metaRows.map(r => (
              <div key={r.k}>
                <div className="text-[20px] font-semibold tabular-nums tracking-tight text-gray-900 leading-none mb-1.5">
                  {counts[r.k as keyof typeof counts]}
                </div>
                <Badge label={r.l} tone={r.t} />
              </div>
            ))}
          </div>
        </div>

        {/* Table */}
        <div>
          <SectionLabel>All requirements</SectionLabel>
          <div className="mt-2.5 bg-white ring-1 ring-black/[0.06] rounded-xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400">Ref</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400">Requirement</th>
                  <th className="hidden sm:table-cell text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400">Scope</th>
                  <th className="text-left px-4 py-2.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {REQUIREMENTS.map(req => (
                  <tr key={req.refCode}>
                    <td className="px-4 py-3 font-mono text-[10px] text-gray-400">{req.refCode}</td>
                    <td className="px-4 py-3 text-[12.5px] font-medium text-gray-800">{req.title}</td>
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
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

function TasksSection() {
  const completionTrend = [8,8,9,10,11,11,11,12,12,13,13,14,14,14];

  const pTone:  Record<string, ToneKey> = { P0: "red", P1: "amber", P2: "blue", P3: "gray" };

  const queueCards = TASKS_QUEUE.map(t => ({ ...t, status: "not_started", blockedBy: null as string | null }));
  const doneCards  = TASKS_DONE.map(t  => ({ ...t, status: "done",        blockedBy: null as string | null }));

  const columns = [
    { key: "attention", label: "Needs Attention", tasks: TASKS_ATTENTION, tone: "red"   as ToneKey },
    { key: "queue",     label: "Queue",           tasks: queueCards,      tone: "gray"  as ToneKey },
    { key: "done",      label: "Finished",        tasks: doneCards,       tone: "green" as ToneKey },
  ];

  return (
    <>
      <PageHeader title="Tasks" sub={`${TASK_STATS.done}/${TASK_STATS.total} complete · ${COMPLETION_PCT}%`} />
      <div className="flex-1 overflow-auto p-5 flex flex-col gap-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <KpiCard icon={CheckCircle2}  label="Done"        value={`${TASK_STATS.done}`}        sub="Shipped"       tone="green" />
          <KpiCard icon={TrendingUp}    label="In progress" value={`${TASK_STATS.inProgress}`}  sub="Active"        tone="blue" />
          <KpiCard icon={AlertTriangle} label="Blocked"     value={`${TASK_STATS.blocked}`}     sub="Action needed" tone="red" />
          <KpiCard icon={Clock}         label="Not started" value={`${TASK_STATS.notStarted}`}  sub="Queued"        tone="gray" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white ring-1 ring-black/[0.06] rounded-xl p-5">
            <SectionLabel>Completion trend · 14d</SectionLabel>
            <p className="text-[10px] text-gray-400 mt-0.5">Cumulative tasks done over time</p>
            <div className="flex items-end gap-2 mt-2 mb-3">
              <span className="text-[28px] font-semibold tabular-nums tracking-tight text-gray-900 leading-none">
                {TASK_STATS.done}
              </span>
              <span className="text-[12px] text-gray-400 mb-0.5">tasks · {COMPLETION_PCT}%</span>
            </div>
            <div style={{ height: 72, overflow: "hidden" }}>
              <LineChart points={completionTrend} color={T.green.fg} height={72} />
            </div>
          </div>
          <div className="bg-white ring-1 ring-black/[0.06] rounded-xl p-5">
            <SectionLabel>Daily velocity · 28d</SectionLabel>
            <p className="text-[10px] text-gray-400 mt-0.5">Each bar = 1 day · recent = darker</p>
            <div className="flex items-end gap-2 mt-2 mb-3">
              <span className="text-[28px] font-semibold tabular-nums tracking-tight text-gray-900 leading-none">
                {DAILY_VELOCITY.reduce((a, b) => a + b, 0)}
              </span>
              <span className="text-[12px] text-gray-400 mb-0.5">tasks shipped</span>
            </div>
            <div style={{ height: 72, overflow: "hidden" }}>
              <BarChart points={DAILY_VELOCITY} color={T.blue.fg} height={72} />
            </div>
          </div>
        </div>

        {/* Kanban */}
        <div>
          <SectionLabel>Board</SectionLabel>
          <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {columns.map(col => (
              <div key={col.key} className="bg-white ring-1 ring-black/[0.06] rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                  <Badge label={col.label} tone={col.tone} />
                  <span className="text-[11px] font-semibold tabular-nums text-gray-400">{col.tasks.length}</span>
                </div>
                <div className="p-3 flex flex-col gap-2">
                  {col.tasks.map(task => {
                    const p = pTone[task.priority] ?? "gray";
                    return (
                      <div key={task.refCode} className="p-3 rounded-lg border border-gray-100 bg-gray-50/70">
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="font-mono text-[10px] text-gray-400">{task.refCode}</span>
                          <Badge label={task.priority} tone={p} />
                        </div>
                        <p className="text-[12.5px] font-semibold text-gray-800 leading-snug">{task.title}</p>
                        {task.blockedBy && (
                          <p className="text-[11px] mt-1.5" style={{ color: T.red.fg }}>↳ {task.blockedBy}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
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
    <div className="flex bg-gray-50 overflow-hidden" style={{ height: "100vh" }}>
      <Sidebar active={section} />
      <div className="flex-1 flex flex-col min-w-0">
        {content[section] ?? content.dashboard}
      </div>
    </div>
  );
}
