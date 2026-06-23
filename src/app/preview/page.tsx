import {
  LayoutDashboard, GitBranch, FileCheck, CheckSquare,
  AlertTriangle, CheckCircle2, TrendingUp, TrendingDown,
  Lock, Coins, Clock, Layers,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─── Demo data ────────────────────────────────────────────────────────────────

const PROJECT = { name: "Kola POS System", deadline: "Dec 15, 2025" };

const TASK_STATS = { total: 24, done: 14, inProgress: 4, blocked: 2, notStarted: 4 };
const COMPLETION_PCT = Math.round((TASK_STATS.done / TASK_STATS.total) * 100);

// 28-day daily task velocity (4 weeks, weekends = 0)
const DAILY_VELOCITY = [
  2, 3, 1, 4, 2, 0, 0,   // W1
  3, 2, 1, 3, 1, 0, 0,   // W2
  1, 3, 2, 0, 1, 0, 0,   // W3
  1, 0, 0, 0, 0, 0, 0,   // W4 (current — most bars empty)
];

// 14-day scope creep additions
const DAILY_SCOPE = [0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 1];

const WEEK_DATA = [
  { week: "W1", done: 6, total: 6 },
  { week: "W2", done: 5, total: 6 },
  { week: "W3", done: 3, total: 6 },
  { week: "W4", done: 0, total: 6 },
];

const BLOCKED_ITEMS = [
  { refCode: "TASK-007", title: "Payment gateway webhook",    blockedBy: "Paystack API credentials not provided", elapsed: "51h", severity: "high" },
  { refCode: "TASK-012", title: "SMS notification delivery", blockedBy: "Provider rate limit — awaiting upgrade", elapsed: "26h", severity: "med"  },
];

const SCOPE_CHANGES = [
  { id: "1", title: "Add loyalty points engine",   source: "Client request",  status: "pending",  impact: "medium", createdAt: "1d ago",  description: "Points-per-purchase system with redemption at checkout. Est. 3–4 days." },
  { id: "2", title: "Bulk product import via CSV", source: "Stakeholder",     status: "accepted", impact: "low",    createdAt: "3d ago",  description: "Allow staff to upload a CSV of products instead of manual entry. Est. 1 day." },
  { id: "3", title: "Multi-currency pricing",      source: "Client request",  status: "rejected", impact: "high",   createdAt: "5d ago",  description: "USD and GBP alongside NGN. Requires exchange-rate API + tax recalcs." },
  { id: "4", title: "WhatsApp receipt delivery",   source: "Client request",  status: "deferred", impact: "low",    createdAt: "6d ago",  description: "Send receipts via WhatsApp Business API instead of SMS only." },
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
  { refCode: "TASK-007", title: "Payment gateway webhook",  status: "blocked",     priority: "P0", blockedBy: "Paystack credentials" },
  { refCode: "TASK-012", title: "SMS notification delivery",status: "blocked",     priority: "P1", blockedBy: "Provider rate limit" },
  { refCode: "TASK-014", title: "Inventory sync module",    status: "in_progress", priority: "P1", blockedBy: null },
  { refCode: "TASK-016", title: "Report export",            status: "in_progress", priority: "P2", blockedBy: null },
  { refCode: "TASK-019", title: "Staff permission matrix",  status: "in_progress", priority: "P1", blockedBy: null },
];
const TASKS_QUEUE = [
  { refCode: "TASK-021", title: "Offline mode cache layer",    status: "in_progress", priority: "P2", blockedBy: null },
  { refCode: "TASK-022", title: "Audit trail export",          status: "not_started", priority: "P3", blockedBy: null },
  { refCode: "TASK-023", title: "Multi-branch rollout config", status: "not_started", priority: "P2", blockedBy: null },
  { refCode: "TASK-024", title: "API documentation",           status: "not_started", priority: "P3", blockedBy: null },
];
const TASKS_DONE = [
  { refCode: "TASK-001", title: "Auth system (JWT + sessions)", status: "done", priority: "P0", blockedBy: null },
  { refCode: "TASK-002", title: "Product catalogue CRUD",       status: "done", priority: "P1", blockedBy: null },
  { refCode: "TASK-003", title: "POS terminal UI",              status: "done", priority: "P0", blockedBy: null },
  { refCode: "TASK-004", title: "Sales dashboard",              status: "done", priority: "P1", blockedBy: null },
  { refCode: "TASK-005", title: "Receipt printing (PDF)",       status: "done", priority: "P2", blockedBy: null },
];

// ─── Design tokens (Varmply-style accent pairs) ───────────────────────────────

const BLUE   = { accent: "#2b7fff", light: "#DBEAFE", text: "#1e40af" };
const GREEN  = { accent: "#15803D", light: "#DCFCE7", text: "#14532d" };
const AMBER  = { accent: "#B45309", light: "#FEF3C7", text: "#78350f" };
const RED    = { accent: "#DC2626", light: "#FEE2E2", text: "#7f1d1d" };

// ─── Shared primitives ────────────────────────────────────────────────────────

/** Varmply-style dense bar chart */
function DenseBarChart({
  points,
  color,
  tintColor,
  height = 80,
}: {
  points: number[];
  color: string;
  tintColor: string;
  height?: number;
}) {
  const maxVal = Math.max(...points, 1);
  const lastIdx = points.length - 1;
  const gapClass = points.length > 14 ? "gap-[1px]" : "gap-[3px]";
  const maxBarPx = height - 8;

  return (
    <div className={`flex w-full items-end ${gapClass}`} style={{ height }}>
      {points.map((val, i) => {
        const isLast = i === lastIdx;
        const barH = val === 0 ? 4 : Math.max(4, Math.round((val / maxVal) * maxBarPx));
        const bg = val === 0 ? "#E5E7EB" : isLast ? color : tintColor;
        return (
          <div key={i} className="flex-1 rounded-[2px]" style={{ height: barH, background: bg }} />
        );
      })}
    </div>
  );
}

/** Inline horizontal progress ladder row */
function LadderRow({ rank, label, value, pct, color }: { rank: number; label: string; value: string; pct: number; color: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="text-[10px] font-black tabular-nums text-[#BBBBCC] w-4 shrink-0" style={{ letterSpacing: "-0.02em" }}>
        {String(rank).padStart(2, "0")}
      </span>
      <div className="flex-1 min-w-0">
        <span className="block text-[11px] font-semibold text-[#0F0F1A] truncate">{label}</span>
        <div className="h-[3px] rounded-full mt-1 overflow-hidden bg-[#F3F4F6]">
          <div className="h-full rounded-full" style={{ width: `${Math.max(6, pct)}%`, background: color }} />
        </div>
      </div>
      <span className="text-[10px] font-bold tabular-nums text-[#0F0F1A] shrink-0">{value}</span>
    </div>
  );
}

/** Varmply-style stat card */
function StatCard({
  icon: Icon, label, value, change, positive = true, accent, accentLight,
}: {
  icon: LucideIcon; label: string; value: string; change?: string;
  positive?: boolean; accent: string; accentLight: string;
}) {
  return (
    <div className="relative bg-white border border-[#E5E7EB] rounded-[16px] p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#BBBBCC] leading-[1.25]">{label}</div>
        <div className="size-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: accentLight }}>
          <Icon size={14} color={accent} strokeWidth={2.25} />
        </div>
      </div>
      <div className="mt-2 font-black tracking-[-0.02em] text-[#0F0F1A] leading-[1.15]"
        style={{ fontSize: "clamp(16px, 1.5vw, 22px)" }}>
        {value}
      </div>
      {change && (
        <div className="inline-flex items-center gap-1 mt-2.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.08em]"
          style={{ background: accentLight, color: accent }}>
          {positive ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}

/** Big perf cell (like Varmply's DashboardPerfCell) */
function PerfCell({
  label, value, sub, points, color, tintColor,
}: {
  label: string; value: string; sub?: string; points: number[]; color: string; tintColor: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#BBBBCC]">{label}</span>
      <div className="font-black tracking-[-0.02em] text-[#0F0F1A] leading-[1]"
        style={{ fontSize: "clamp(24px, 2.6vw, 32px)" }}>
        {value}
      </div>
      {sub && <p className="text-[11px] text-[#BBBBCC] font-medium mt-0.5">{sub}</p>}
      <div className="mt-4">
        <DenseBarChart points={points} color={color} tintColor={tintColor} />
      </div>
    </div>
  );
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
    <aside className="hidden sm:flex w-[190px] flex-col bg-white border-r border-[#F3F4F6] h-full">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 pt-6 pb-5 mb-2">
        <div className="size-7 rounded-lg flex items-center justify-center" style={{ background: BLUE.accent }}>
          <Lock size={13} color="#fff" strokeWidth={2.5} />
        </div>
        <span className="text-[17px] font-black tracking-tight text-[#0F0F1A]">ShipLock</span>
      </div>

      {/* Nav */}
      <nav className="flex flex-col flex-1 min-h-0 px-5">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#BBBBCC] mb-2">Project</span>
        {NAV.map(({ key, label, Icon }) => {
          const isActive = key === active;
          return (
            <div key={key}
              className={`relative flex items-center gap-3 py-3 text-[13px] cursor-default transition-colors ${
                isActive ? "font-bold" : "font-semibold text-[#4A5565]"
              }`}
              style={{ color: isActive ? BLUE.accent : undefined }}>
              <span className="absolute -left-5 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r"
                style={{ background: isActive ? BLUE.accent : "transparent" }} />
              <Icon size={17} strokeWidth={isActive ? 2.5 : 2}
                style={{ color: isActive ? BLUE.accent : "#6D6D78" }} />
              {label}
            </div>
          );
        })}
        <div className="mt-auto pt-4 border-t border-[#F3F4F6]">
          {["Settings", "Team"].map(item => (
            <div key={item} className="flex items-center gap-3 py-3 text-[13px] font-semibold text-[#BBBBCC] cursor-default">{item}</div>
          ))}
        </div>
      </nav>

      {/* Project card */}
      <div className="px-5 pb-6">
        <div className="rounded-[12px] border border-[#E5E7EB] p-3">
          <p className="text-[11px] font-black text-[#0F0F1A] truncate">{PROJECT.name}</p>
          <p className="text-[11px] text-[#BBBBCC] font-medium mt-0.5">MVP · {PROJECT.deadline}</p>
        </div>
      </div>
    </aside>
  );
}

// ─── Page header ──────────────────────────────────────────────────────────────

function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className="flex-shrink-0 flex items-center justify-between bg-white border-b border-[#E5E7EB] px-4 sm:px-6"
      style={{ paddingTop: "0.75rem", paddingBottom: "0.75rem" }}>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#BBBBCC]">{title}</span>
        {sub && <span className="hidden sm:block text-[10px] text-[#BBBBCC]">· {sub}</span>}
      </div>
      <div className="flex items-center gap-3">
        <div className="size-8 rounded-full bg-[#EFF6FF] border border-black/5 flex items-center justify-center text-[12px] font-bold"
          style={{ color: BLUE.accent }}>P</div>
      </div>
    </header>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function DashboardSection() {
  const pending = SCOPE_CHANGES.filter(c => c.status === "pending").length;
  const weeklyLadder = WEEK_DATA.map((w, i) => ({
    label: w.week, value: `${w.done}/${w.total}`,
    pct: (w.done / w.total) * 100, color: BLUE.accent,
    rank: i + 1,
  }));

  return (
    <>
      <PageHeader title="Dashboard" sub={PROJECT.name} />
      <div className="flex-1 overflow-auto px-4 sm:px-6 py-5 flex flex-col lg:flex-row gap-5">

        {/* ── Main column ── */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Stat cards — mobile only */}
          <div className="sm:hidden grid grid-cols-2 gap-2.5">
            <StatCard icon={TrendingUp} label="Completion"     value={`${COMPLETION_PCT}%`} change="On track"             accent={BLUE.accent}  accentLight={BLUE.light} />
            <StatCard icon={CheckCircle2} label="Tasks Done"   value={`${TASK_STATS.done}/${TASK_STATS.total}`} change="14 shipped"   accent={GREEN.accent} accentLight={GREEN.light} />
            <StatCard icon={AlertTriangle} label="Blocked"     value={`${TASK_STATS.blocked}`} change="Need action" positive={false} accent={RED.accent}   accentLight={RED.light} />
            <StatCard icon={GitBranch} label="Scope Changes"   value={`${SCOPE_CHANGES.length}`} change={`${pending} pending`} positive={false} accent={AMBER.accent} accentLight={AMBER.light} />
          </div>

          {/* Performance card */}
          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#BBBBCC]">Sprint Performance</span>
                <h3 className="font-black tracking-tight text-[#0F0F1A] leading-[1]"
                  style={{ fontSize: "clamp(14px, 1.5vw, 18px)" }}>Last 28 days</h3>
              </div>
              <div className="flex items-center gap-4">
                {["28d", "14d", "7d"].map((p, i) => (
                  <button key={p} className={`text-[11px] font-bold uppercase tracking-[0.14em] pb-1.5 relative ${i === 0 ? "" : "text-[#BBBBCC]"}`}
                    style={{ color: i === 0 ? BLUE.accent : undefined }}>
                    {p}
                    {i === 0 && <span className="absolute left-0 right-0 -bottom-px h-[2px] rounded-full" style={{ background: BLUE.accent }} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-stretch gap-6 md:gap-0">
              <div className="flex-1 min-w-0 md:pr-8">
                <PerfCell label="Tasks Completed" value={`${TASK_STATS.done}`}
                  sub={`${COMPLETION_PCT}% of ${TASK_STATS.total} total tasks`}
                  points={DAILY_VELOCITY} color={GREEN.accent} tintColor="#BBF7D0" />
              </div>
              <div className="hidden md:block w-px bg-[#EFEFEF] self-stretch flex-shrink-0" />
              <div className="flex-1 min-w-0 md:px-8">
                <PerfCell label="Scope Creep" value={`+${SCOPE_CHANGES.length} items`}
                  sub="Added outside original brief"
                  points={DAILY_SCOPE} color={RED.accent} tintColor="#FECACA" />
              </div>
              <div className="hidden md:block w-px bg-[#EFEFEF] self-stretch flex-shrink-0" />
              <div className="flex-1 min-w-0 md:pl-8">
                <div className="flex flex-col h-full">
                  <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#BBBBCC]">Weekly Breakdown</span>
                  <div className="font-black tracking-[-0.02em] text-[#0F0F1A] leading-[1] mt-2"
                    style={{ fontSize: "clamp(24px, 2.6vw, 32px)" }}>W{WEEK_DATA.findIndex(w => w.done < w.total) + 1}</div>
                  <p className="text-[11px] text-[#BBBBCC] font-medium mt-0.5 mb-5">Current sprint</p>
                  <div className="flex flex-col gap-2">
                    {weeklyLadder.map(row => (
                      <LadderRow key={row.label} rank={row.rank} label={row.label} value={row.value} pct={row.pct} color={BLUE.accent} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Blocked items */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#BBBBCC]">Blocked — Needs Action</span>
              <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: RED.accent }}>
                {BLOCKED_ITEMS.length} item{BLOCKED_ITEMS.length !== 1 ? "s" : ""}
              </span>
            </div>
            {BLOCKED_ITEMS.map(item => (
              <div key={item.refCode}
                className="rounded-[16px] border border-[#E5E7EB] bg-white p-4 flex items-start gap-4">
                <div className="flex-1 min-w-0 flex flex-col gap-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-[10px] text-[#BBBBCC]">{item.refCode}</span>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.08em]"
                      style={{ background: item.severity === "high" ? RED.light : AMBER.light, color: item.severity === "high" ? RED.accent : AMBER.accent }}>
                      {item.severity === "high" ? "Critical" : "Warning"}
                    </div>
                  </div>
                  <p className="text-[14px] font-black tracking-tight text-[#0F0F1A]">{item.title}</p>
                  <p className="text-[12px] text-[#6D6D78] font-medium">↳ {item.blockedBy}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <span className="text-[11px] font-bold tabular-nums"
                    style={{ color: item.severity === "high" ? RED.accent : AMBER.accent }}>{item.elapsed}</span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#BBBBCC]">elapsed</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right stats panel (desktop) ── */}
        <div className="hidden sm:flex w-[220px] xl:w-[256px] flex-shrink-0 flex-col gap-3 sticky top-0 self-start">
          <StatCard icon={TrendingUp}    label="Completion"     value={`${COMPLETION_PCT}%`}                          change="On track"                 accent={BLUE.accent}  accentLight={BLUE.light} />
          <StatCard icon={CheckCircle2}  label="Tasks Done"     value={`${TASK_STATS.done} / ${TASK_STATS.total}`}    change="14 shipped"               accent={GREEN.accent} accentLight={GREEN.light} />
          <StatCard icon={AlertTriangle} label="Blocked"        value={`${TASK_STATS.blocked}`}                       change="Need action" positive={false} accent={RED.accent}   accentLight={RED.light} />
          <StatCard icon={GitBranch}     label="Scope Changes"  value={`${SCOPE_CHANGES.length}`}                     change={`${pending} pending`} positive={false} accent={AMBER.accent} accentLight={AMBER.light} />

          <div className="rounded-[16px] border p-4 flex flex-col gap-2 mt-1"
            style={{ background: BLUE.light, borderColor: "#BFDBFE" }}>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: BLUE.accent }}>Delivery Health</span>
            <h3 className="font-black tracking-tight text-[#0F0F1A] leading-[1.05]"
              style={{ fontSize: "clamp(18px, 2vw, 22px)" }}>On Track</h3>
            <p className="text-[12px] font-medium" style={{ color: BLUE.text }}>
              3 weeks to deadline. 2 blockers need immediate resolution.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Scope Changes ────────────────────────────────────────────────────────────

function ScopeChangesSection() {
  const counts = {
    pending:  SCOPE_CHANGES.filter(c => c.status === "pending").length,
    accepted: SCOPE_CHANGES.filter(c => c.status === "accepted").length,
    rejected: SCOPE_CHANGES.filter(c => c.status === "rejected").length,
    deferred: SCOPE_CHANGES.filter(c => c.status === "deferred").length,
  };
  const total = SCOPE_CHANGES.length;

  const impactCount = {
    high:   SCOPE_CHANGES.filter(c => c.impact === "high").length,
    medium: SCOPE_CHANGES.filter(c => c.impact === "medium").length,
    low:    SCOPE_CHANGES.filter(c => c.impact === "low").length,
  };

  const statusStyle = {
    pending:  { label: "Pending",  accent: AMBER.accent, light: AMBER.light },
    accepted: { label: "Accepted", accent: GREEN.accent, light: GREEN.light },
    rejected: { label: "Rejected", accent: RED.accent,   light: RED.light   },
    deferred: { label: "Deferred", accent: "#6B7280",    light: "#F3F4F6"   },
  };
  const impactStyle = {
    high:   { accent: RED.accent,   light: RED.light   },
    medium: { accent: AMBER.accent, light: AMBER.light },
    low:    { accent: GREEN.accent, light: GREEN.light },
  };

  return (
    <>
      <PageHeader title="Scope Changes" sub={`${total} total · ${counts.pending} pending`} />
      <div className="flex-1 overflow-auto px-4 sm:px-6 py-5 flex flex-col lg:flex-row gap-5">

        <div className="flex-1 min-w-0 flex flex-col gap-5">

          {/* Mobile stat tiles */}
          <div className="sm:hidden grid grid-cols-2 gap-2.5">
            <StatCard icon={GitBranch}    label="Total"    value={`${total}`}            accent={BLUE.accent}  accentLight={BLUE.light} />
            <StatCard icon={Clock}        label="Pending"  value={`${counts.pending}`}   accent={AMBER.accent} accentLight={AMBER.light} />
            <StatCard icon={CheckCircle2} label="Accepted" value={`${counts.accepted}`}  accent={GREEN.accent} accentLight={GREEN.light} />
            <StatCard icon={AlertTriangle}label="Rejected" value={`${counts.rejected}`}  accent={RED.accent}   accentLight={RED.light} />
          </div>

          {/* Breakdown card */}
          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 sm:p-7">
            <div className="flex flex-col gap-1 mb-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#BBBBCC]">Status Breakdown</span>
              <h3 className="font-black tracking-tight text-[#0F0F1A] leading-[1]"
                style={{ fontSize: "clamp(14px, 1.5vw, 18px)" }}>
                {counts.pending} item{counts.pending !== 1 ? "s" : ""} awaiting decision
              </h3>
            </div>

            {/* Stacked bar */}
            <div className="h-3 rounded-full overflow-hidden flex gap-px mb-6">
              {(["pending", "accepted", "rejected", "deferred"] as const).filter(k => counts[k] > 0).map(k => (
                <div key={k} className="h-full rounded-sm"
                  style={{ width: `${(counts[k] / total) * 100}%`, background: statusStyle[k].accent }} />
              ))}
            </div>

            <div className="flex flex-col md:flex-row md:items-stretch gap-6 md:gap-0">
              <div className="flex-1 min-w-0 md:pr-8">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#BBBBCC] block mb-4">By Status</span>
                <div className="flex flex-col gap-3">
                  {(["pending", "accepted", "rejected", "deferred"] as const).map(k => (
                    <LadderRow key={k} rank={(["pending","accepted","rejected","deferred"]).indexOf(k)+1}
                      label={statusStyle[k].label} value={`${counts[k]}`}
                      pct={(counts[k]/total)*100} color={statusStyle[k].accent} />
                  ))}
                </div>
              </div>
              <div className="hidden md:block w-px bg-[#EFEFEF] self-stretch flex-shrink-0" />
              <div className="flex-1 min-w-0 md:px-8">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#BBBBCC] block mb-4">Impact Distribution</span>
                <div className="flex flex-col gap-3">
                  {(["high","medium","low"] as const).map((k, i) => (
                    <LadderRow key={k} rank={i+1}
                      label={`${k.charAt(0).toUpperCase()+k.slice(1)} impact`}
                      value={`${impactCount[k]}`}
                      pct={(impactCount[k]/total)*100} color={impactStyle[k].accent} />
                  ))}
                </div>
              </div>
              <div className="hidden md:block w-px bg-[#EFEFEF] self-stretch flex-shrink-0" />
              <div className="flex-1 min-w-0 md:pl-8">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#BBBBCC] block mb-4">Scope Creep Trend</span>
                <div className="font-black tracking-[-0.02em] text-[#0F0F1A] leading-[1]"
                  style={{ fontSize: "clamp(24px, 2.6vw, 32px)" }}>+{total}</div>
                <p className="text-[11px] text-[#BBBBCC] font-medium mt-0.5 mb-4">items added past 2 weeks</p>
                <DenseBarChart points={DAILY_SCOPE} color={RED.accent} tintColor="#FECACA" height={72} />
              </div>
            </div>
          </div>

          {/* Change cards */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#BBBBCC]">All Changes</span>
            {SCOPE_CHANGES.map(change => {
              const s = statusStyle[change.status as keyof typeof statusStyle];
              const imp = impactStyle[change.impact as keyof typeof impactStyle];
              return (
                <div key={change.id} className="rounded-[16px] border border-[#E5E7EB] bg-white p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-[0.1em]"
                        style={{ background: s.light, color: s.accent }}>
                        <span className="size-1.5 rounded-full" style={{ background: s.accent }} />
                        {s.label}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full"
                        style={{ background: imp.light, color: imp.accent }}>
                        {change.impact} impact
                      </span>
                    </div>
                    <span className="text-[10px] text-[#BBBBCC] font-medium shrink-0">{change.createdAt}</span>
                  </div>
                  <p className="text-[14px] font-black tracking-tight text-[#0F0F1A] mb-1">{change.title}</p>
                  <p className="text-[12px] text-[#6D6D78] leading-relaxed">{change.description}</p>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#BBBBCC] mt-2">Via {change.source}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right stats */}
        <div className="hidden sm:flex w-[220px] xl:w-[256px] flex-shrink-0 flex-col gap-3 sticky top-0 self-start">
          <StatCard icon={GitBranch}    label="Total Changes" value={`${total}`}           accent={BLUE.accent}  accentLight={BLUE.light} />
          <StatCard icon={Clock}        label="Pending"       value={`${counts.pending}`}  change="Need decision" positive={false} accent={AMBER.accent} accentLight={AMBER.light} />
          <StatCard icon={CheckCircle2} label="Accepted"      value={`${counts.accepted}`} change="Approved"      accent={GREEN.accent} accentLight={GREEN.light} />
          <StatCard icon={AlertTriangle}label="Rejected"      value={`${counts.rejected}`} change="Declined"  positive={false} accent={RED.accent} accentLight={RED.light} />
          <div className="rounded-[16px] border p-4 flex flex-col gap-2 mt-1"
            style={{ background: RED.light, borderColor: "#FECACA" }}>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: RED.accent }}>Watch Out</span>
            <h3 className="font-black tracking-tight text-[#0F0F1A] leading-[1.05]"
              style={{ fontSize: "clamp(16px, 1.8vw, 20px)" }}>Scope grew 300%</h3>
            <p className="text-[12px] font-medium" style={{ color: RED.text }}>
              Every unacknowledged change risks delivery. Lock scope now.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Requirements ─────────────────────────────────────────────────────────────

function RequirementsSection() {
  const counts = {
    approved:  REQUIREMENTS.filter(r => r.status === "approved").length,
    pending:   REQUIREMENTS.filter(r => r.status === "pending_approval").length,
    draft:     REQUIREMENTS.filter(r => r.status === "draft").length,
    disputed:  REQUIREMENTS.filter(r => r.status === "disputed").length,
    mvp:       REQUIREMENTS.filter(r => r.cls === "mvp").length,
    post_mvp:  REQUIREMENTS.filter(r => r.cls === "post_mvp").length,
    oos:       REQUIREMENTS.filter(r => r.cls === "out_of_scope").length,
  };
  const total = REQUIREMENTS.length;

  // Approval velocity as fake 14-day trend (accumulated approvals)
  const approvalTrend = [0,0,1,2,3,3,3,4,4,5,5,6,6,6];

  const clsCfg = {
    mvp:          { label: "MVP",          accent: BLUE.accent,  light: BLUE.light  },
    post_mvp:     { label: "Post-MVP",     accent: "#6B7280",    light: "#F3F4F6"   },
    out_of_scope: { label: "Out of Scope", accent: RED.accent,   light: RED.light   },
  };
  const stCfg = {
    draft:            { label: "Draft",          accent: "#6B7280",    light: "#F3F4F6"   },
    pending_approval: { label: "Pending",         accent: AMBER.accent, light: AMBER.light },
    approved:         { label: "Approved",        accent: GREEN.accent, light: GREEN.light },
    disputed:         { label: "Disputed",        accent: RED.accent,   light: RED.light   },
  };

  return (
    <>
      <PageHeader title="Requirements" sub={`${total} total`} />
      <div className="flex-1 overflow-auto px-4 sm:px-6 py-5 flex flex-col lg:flex-row gap-5">

        <div className="flex-1 min-w-0 flex flex-col gap-5">

          <div className="sm:hidden grid grid-cols-2 gap-2.5">
            <StatCard icon={Layers}       label="MVP Scope"  value={`${counts.mvp}`}      accent={BLUE.accent}  accentLight={BLUE.light} />
            <StatCard icon={CheckCircle2} label="Approved"   value={`${counts.approved}`} change="Client-signed" accent={GREEN.accent}  accentLight={GREEN.light} />
            <StatCard icon={Clock}        label="Pending"    value={`${counts.pending}`}  change="Awaiting" positive={false} accent={AMBER.accent} accentLight={AMBER.light} />
            <StatCard icon={AlertTriangle}label="Disputed"   value={`${counts.disputed}`} change="Conflict" positive={false} accent={RED.accent}   accentLight={RED.light} />
          </div>

          {/* Approval rate performance card */}
          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 sm:p-7">
            <div className="flex flex-col gap-1 mb-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#BBBBCC]">Approval Overview</span>
              <h3 className="font-black tracking-tight text-[#0F0F1A] leading-[1]"
                style={{ fontSize: "clamp(14px, 1.5vw, 18px)" }}>
                {Math.round((counts.approved / total) * 100)}% client-approved
              </h3>
            </div>

            <div className="flex flex-col md:flex-row md:items-stretch gap-6 md:gap-0">
              <div className="flex-1 min-w-0 md:pr-8">
                <PerfCell label="Approvals Over Time" value={`${counts.approved}`}
                  sub="Requirements locked by client" points={approvalTrend}
                  color={GREEN.accent} tintColor="#BBF7D0" />
              </div>
              <div className="hidden md:block w-px bg-[#EFEFEF] self-stretch flex-shrink-0" />
              <div className="flex-1 min-w-0 md:px-8">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#BBBBCC] block mb-4">By Status</span>
                <div className="flex flex-col gap-3">
                  <LadderRow rank={1} label="Approved"  value={`${counts.approved}`}  pct={(counts.approved/total)*100}  color={GREEN.accent} />
                  <LadderRow rank={2} label="Pending"   value={`${counts.pending}`}   pct={(counts.pending/total)*100}   color={AMBER.accent} />
                  <LadderRow rank={3} label="Draft"     value={`${counts.draft}`}     pct={(counts.draft/total)*100}     color="#9CA3AF" />
                  <LadderRow rank={4} label="Disputed"  value={`${counts.disputed}`}  pct={(counts.disputed/total)*100}  color={RED.accent} />
                </div>
              </div>
              <div className="hidden md:block w-px bg-[#EFEFEF] self-stretch flex-shrink-0" />
              <div className="flex-1 min-w-0 md:pl-8">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#BBBBCC] block mb-4">By Classification</span>
                <div className="flex flex-col gap-3">
                  <LadderRow rank={1} label="MVP"          value={`${counts.mvp}`}     pct={(counts.mvp/total)*100}     color={BLUE.accent} />
                  <LadderRow rank={2} label="Post-MVP"     value={`${counts.post_mvp}`} pct={(counts.post_mvp/total)*100} color="#9CA3AF" />
                  <LadderRow rank={3} label="Out of Scope" value={`${counts.oos}`}      pct={(counts.oos/total)*100}      color={RED.accent} />
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#BBBBCC]">All Requirements</span>
            <div className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#F3F4F6] bg-[#FAFAFA]">
                    <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[#BBBBCC]">Ref</th>
                    <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[#BBBBCC]">Requirement</th>
                    <th className="hidden sm:table-cell text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[#BBBBCC]">Scope</th>
                    <th className="text-left px-4 py-3 text-[9px] font-bold uppercase tracking-[0.14em] text-[#BBBBCC]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F9FAFB]">
                  {REQUIREMENTS.map(req => {
                    const cls = clsCfg[req.cls as keyof typeof clsCfg];
                    const st  = stCfg[req.status as keyof typeof stCfg];
                    return (
                      <tr key={req.refCode} className="hover:bg-[#FAFAFA] transition-colors">
                        <td className="px-4 py-3 font-mono text-[10px] text-[#BBBBCC]">{req.refCode}</td>
                        <td className="px-4 py-3 text-[13px] font-semibold text-[#0F0F1A]">{req.title}</td>
                        <td className="hidden sm:table-cell px-4 py-3">
                          <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full"
                            style={{ background: cls.light, color: cls.accent }}>{cls.label}</span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full"
                            style={{ background: st.light, color: st.accent }}>
                            {req.auto ? "Auto-Approved" : st.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right stats */}
        <div className="hidden sm:flex w-[220px] xl:w-[256px] flex-shrink-0 flex-col gap-3 sticky top-0 self-start">
          <StatCard icon={Layers}       label="MVP Scope"  value={`${counts.mvp}`}       accent={BLUE.accent}  accentLight={BLUE.light} />
          <StatCard icon={CheckCircle2} label="Approved"   value={`${counts.approved}`}  change="Client-signed" accent={GREEN.accent}  accentLight={GREEN.light} />
          <StatCard icon={Clock}        label="Pending"    value={`${counts.pending}`}   change="Awaiting" positive={false} accent={AMBER.accent} accentLight={AMBER.light} />
          <StatCard icon={AlertTriangle}label="Disputed"   value={`${counts.disputed}`}  change="Conflict" positive={false} accent={RED.accent} accentLight={RED.light} />
          <div className="rounded-[16px] border p-4 flex flex-col gap-2 mt-1"
            style={{ background: GREEN.light, borderColor: "#BBF7D0" }}>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: GREEN.accent }}>48-hr Rule</span>
            <h3 className="font-black tracking-tight text-[#0F0F1A] leading-[1.05]"
              style={{ fontSize: "clamp(16px, 1.8vw, 20px)" }}>Silence = Consent</h3>
            <p className="text-[12px] font-medium" style={{ color: GREEN.text }}>
              No response in 48h auto-approves the requirement.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

function TasksSection() {
  // 14-day task completion trend
  const completionTrend = [8, 8, 9, 10, 11, 11, 11, 12, 12, 13, 13, 14, 14, 14];

  const priorityDist = {
    P0: [...TASKS_ATTENTION, ...TASKS_QUEUE, ...TASKS_DONE].filter(t => t.priority === "P0").length,
    P1: [...TASKS_ATTENTION, ...TASKS_QUEUE, ...TASKS_DONE].filter(t => t.priority === "P1").length,
    P2: [...TASKS_ATTENTION, ...TASKS_QUEUE, ...TASKS_DONE].filter(t => t.priority === "P2").length,
    P3: [...TASKS_ATTENTION, ...TASKS_QUEUE, ...TASKS_DONE].filter(t => t.priority === "P3").length,
  };
  const allCount = Object.values(priorityDist).reduce((a, b) => a + b, 0);

  const taskStatusStyle = {
    blocked:     { label: "Blocked",     accent: RED.accent,   light: "#FFF1F2", border: "#FECDD3" },
    in_progress: { label: "In Progress", accent: BLUE.accent,  light: "#EFF6FF", border: "#BFDBFE" },
    not_started: { label: "Not Started", accent: "#6B7280",    light: "#F9FAFB", border: "#E5E7EB" },
    done:        { label: "Done",        accent: GREEN.accent, light: "#F0FDF4", border: "#BBF7D0" },
  };
  const taskPriStyle = {
    P0: { color: "text-red-600 bg-red-50 border border-red-200" },
    P1: { color: "text-orange-600 bg-orange-50 border border-orange-200" },
    P2: { color: "text-amber-700 bg-amber-50 border border-amber-200" },
    P3: { color: "text-zinc-500 bg-zinc-100 border border-zinc-200" },
  };

  const columns = [
    { key: "attention", label: "Needs Attention", tasks: TASKS_ATTENTION, accent: RED.accent },
    { key: "queue",     label: "Queue",           tasks: TASKS_QUEUE,     accent: BLUE.accent },
    { key: "done",      label: "Finished",        tasks: TASKS_DONE,      accent: GREEN.accent },
  ];

  return (
    <>
      <PageHeader title="Tasks" sub={`${TASK_STATS.done}/${TASK_STATS.total} complete · ${COMPLETION_PCT}%`} />
      <div className="flex-1 overflow-auto px-4 sm:px-6 py-5 flex flex-col lg:flex-row gap-5">

        <div className="flex-1 min-w-0 flex flex-col gap-5">

          <div className="sm:hidden grid grid-cols-2 gap-2.5">
            <StatCard icon={CheckCircle2}  label="Done"        value={`${TASK_STATS.done}`}        change="Shipped"       accent={GREEN.accent} accentLight={GREEN.light} />
            <StatCard icon={TrendingUp}    label="In Progress" value={`${TASK_STATS.inProgress}`}  change="Active"        accent={BLUE.accent}  accentLight={BLUE.light} />
            <StatCard icon={AlertTriangle} label="Blocked"     value={`${TASK_STATS.blocked}`}     change="Action needed" positive={false} accent={RED.accent}   accentLight={RED.light} />
            <StatCard icon={Clock}         label="Not Started" value={`${TASK_STATS.notStarted}`}  change="Queued"        accent="#6B7280" accentLight="#F3F4F6" />
          </div>

          {/* Performance card */}
          <div className="rounded-[20px] border border-[#E5E7EB] bg-white p-5 sm:p-7">
            <div className="flex flex-col gap-1 mb-6">
              <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#BBBBCC]">Task Performance</span>
              <h3 className="font-black tracking-tight text-[#0F0F1A] leading-[1]"
                style={{ fontSize: "clamp(14px, 1.5vw, 18px)" }}>Sprint progress overview</h3>
            </div>

            <div className="flex flex-col md:flex-row md:items-stretch gap-6 md:gap-0">
              <div className="flex-1 min-w-0 md:pr-8">
                <PerfCell label="Completion Trend" value={`${TASK_STATS.done} tasks`}
                  sub={`${COMPLETION_PCT}% of total · 14 days`}
                  points={completionTrend} color={GREEN.accent} tintColor="#BBF7D0" />
              </div>
              <div className="hidden md:block w-px bg-[#EFEFEF] self-stretch flex-shrink-0" />
              <div className="flex-1 min-w-0 md:px-8">
                <PerfCell label="Daily Velocity" value={`${DAILY_VELOCITY.reduce((a,b)=>a+b,0)} pts`}
                  sub="Tasks shipped per day"
                  points={DAILY_VELOCITY} color={BLUE.accent} tintColor="#BFDBFE" />
              </div>
              <div className="hidden md:block w-px bg-[#EFEFEF] self-stretch flex-shrink-0" />
              <div className="flex-1 min-w-0 md:pl-8">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#BBBBCC] block mb-4">Priority Split</span>
                <div className="flex flex-col gap-3">
                  {(["P0","P1","P2","P3"] as const).map((p, i) => {
                    const colors = [RED.accent, AMBER.accent, BLUE.accent, "#9CA3AF"];
                    return (
                      <LadderRow key={p} rank={i+1} label={`${p} — ${["Critical","High","Medium","Low"][i]}`}
                        value={`${priorityDist[p]}`} pct={(priorityDist[p]/allCount)*100} color={colors[i]} />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Kanban columns */}
          <div className="flex flex-col gap-3">
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#BBBBCC]">Board</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-start">
              {columns.map(col => (
                <div key={col.key} className="rounded-[16px] border border-[#E5E7EB] bg-white overflow-hidden">
                  <div className="px-4 py-3 border-b border-[#F3F4F6] flex items-center justify-between"
                    style={{ borderTop: `3px solid ${col.accent}` }}>
                    <span className="text-[12px] font-black text-[#0F0F1A]">{col.label}</span>
                    <span className="text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-full bg-[#F3F4F6] text-[#BBBBCC]">{col.tasks.length}</span>
                  </div>
                  <div className="p-3 flex flex-col gap-2">
                    {col.tasks.map(task => {
                      const s = taskStatusStyle[task.status as keyof typeof taskStatusStyle] ?? taskStatusStyle.not_started;
                      const p = taskPriStyle[task.priority as keyof typeof taskPriStyle] ?? taskPriStyle.P3;
                      return (
                        <div key={task.refCode} className="p-3 rounded-[10px] border"
                          style={{ background: s.light, borderColor: s.border }}>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <span className="font-mono text-[9px] text-[#BBBBCC]">{task.refCode}</span>
                            <span className={`text-[9px] px-1.5 py-px rounded-full font-bold ${p.color}`}>{task.priority}</span>
                          </div>
                          <p className="text-[12px] font-bold text-[#0F0F1A] leading-snug">{task.title}</p>
                          {task.blockedBy && (
                            <p className="text-[10px] font-medium mt-1" style={{ color: RED.accent }}>↳ {task.blockedBy}</p>
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

        {/* Right stats */}
        <div className="hidden sm:flex w-[220px] xl:w-[256px] flex-shrink-0 flex-col gap-3 sticky top-0 self-start">
          <StatCard icon={CheckCircle2}  label="Done"        value={`${TASK_STATS.done}`}       change="Shipped"       accent={GREEN.accent} accentLight={GREEN.light} />
          <StatCard icon={TrendingUp}    label="In Progress" value={`${TASK_STATS.inProgress}`} change="Active"        accent={BLUE.accent}  accentLight={BLUE.light} />
          <StatCard icon={AlertTriangle} label="Blocked"     value={`${TASK_STATS.blocked}`}    change="Action needed" positive={false} accent={RED.accent} accentLight={RED.light} />
          <StatCard icon={Coins}         label="Completion"  value={`${COMPLETION_PCT}%`}        change="On track"      accent={BLUE.accent}  accentLight={BLUE.light} />
          <div className="rounded-[16px] border p-4 flex flex-col gap-2 mt-1"
            style={{ background: AMBER.light, borderColor: "#FDE68A" }}>
            <span className="text-[11px] font-bold uppercase tracking-[0.14em]" style={{ color: AMBER.accent }}>Heads Up</span>
            <h3 className="font-black tracking-tight text-[#0F0F1A] leading-[1.05]"
              style={{ fontSize: "clamp(16px, 1.8vw, 20px)" }}>W3 slowing down</h3>
            <p className="text-[12px] font-medium" style={{ color: AMBER.text }}>
              Only 3/6 tasks completed this week. 2 blockers unresolved.
            </p>
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
  const { section = "dashboard" } = await searchParams;

  const content: Record<string, React.ReactNode> = {
    dashboard:       <DashboardSection />,
    "scope-changes": <ScopeChangesSection />,
    requirements:    <RequirementsSection />,
    tasks:           <TasksSection />,
  };

  return (
    <div className="flex bg-[#F9FAFB] overflow-hidden" style={{ minHeight: "100vh" }}>
      <Sidebar active={section} />
      <div className="flex-1 flex flex-col min-w-0 bg-[#F9FAFB]">
        {content[section] ?? content.dashboard}
      </div>
    </div>
  );
}
