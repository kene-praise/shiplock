import {
  LayoutDashboard, GitBranch, FileCheck, CheckSquare,
  AlertTriangle, CheckCircle2, TrendingUp,
  CircleCheck, CircleDot, CircleMinus, Lock,
} from "lucide-react";

// ─── Demo data ────────────────────────────────────────────────────────────────

const PROJECT = { name: "Kola POS System", deadline: "Dec 15, 2025" };
const TASK_STATS = { total: 24, done: 14, inProgress: 4, blocked: 2, notStarted: 4 };
const COMPLETION_PCT = Math.round((TASK_STATS.done / TASK_STATS.total) * 100);

const BLOCKED_ITEMS = [
  { refCode: "TASK-007", title: "Payment gateway webhook", blockedBy: "Paystack API credentials not provided", elapsed: "51h", level: "red" },
  { refCode: "TASK-012", title: "SMS notification delivery", blockedBy: "Provider rate limit — awaiting upgrade", elapsed: "26h", level: "amber" },
];

const WEEK_DATA = [
  { week: "W1", done: 6, total: 6 },
  { week: "W2", done: 5, total: 6 },
  { week: "W3", done: 3, total: 6 },
  { week: "W4", done: 0, total: 6 },
];

// Scope creep trend — cumulative added scope items over time
const SCOPE_TREND = [0, 1, 1, 2, 2, 3, 3, 4, 4, 4, 5, 6, 7, 8, 9];

// Velocity trend — tasks done per day (last 2 weeks)
const VELOCITY_TREND = [2, 3, 1, 4, 2, 3, 3, 1, 0, 2, 1, 3, 2, 1];

const SCOPE_CHANGES = [
  { id: "1", title: "Add loyalty points engine",   source: "client_request", status: "pending",  impact: "medium", createdAt: "1d ago" },
  { id: "2", title: "Bulk product import via CSV", source: "stakeholder",    status: "accepted", impact: "low",    createdAt: "3d ago" },
  { id: "3", title: "Multi-currency pricing",      source: "client_request", status: "rejected", impact: "high",   createdAt: "5d ago" },
  { id: "4", title: "WhatsApp receipt delivery",   source: "client_request", status: "deferred", impact: "low",    createdAt: "6d ago" },
];

const REQUIREMENTS = [
  { refCode: "REQ-001", title: "POS terminal with offline mode",  classification: "mvp",          status: "approved",         autoApproved: false },
  { refCode: "REQ-002", title: "Real-time inventory sync",        classification: "mvp",          status: "approved",         autoApproved: false },
  { refCode: "REQ-003", title: "Staff role management (3 tiers)", classification: "mvp",          status: "approved",         autoApproved: true  },
  { refCode: "REQ-004", title: "Sales analytics dashboard",       classification: "mvp",          status: "approved",         autoApproved: false },
  { refCode: "REQ-005", title: "Customer receipt history",        classification: "mvp",          status: "pending_approval", autoApproved: false },
  { refCode: "REQ-006", title: "Paystack payment gateway",        classification: "mvp",          status: "approved",         autoApproved: false },
  { refCode: "REQ-007", title: "Audit log export (CSV)",          classification: "mvp",          status: "pending_approval", autoApproved: false },
  { refCode: "REQ-008", title: "Loyalty points engine",           classification: "post_mvp",     status: "draft",            autoApproved: false },
  { refCode: "REQ-009", title: "WhatsApp notifications",          classification: "post_mvp",     status: "draft",            autoApproved: false },
  { refCode: "REQ-010", title: "Multi-currency pricing",          classification: "out_of_scope", status: "disputed",         autoApproved: false },
];

const TASKS_DATA = {
  attention: [
    { refCode: "TASK-007", title: "Payment gateway webhook",  status: "blocked",     priority: "p0_critical", week: "W3", blockedBy: "Paystack credentials" },
    { refCode: "TASK-012", title: "SMS notification delivery",status: "blocked",     priority: "p1_high",     week: "W3", blockedBy: "Provider rate limit" },
    { refCode: "TASK-014", title: "Inventory sync module",    status: "in_progress", priority: "p1_high",     week: "W3", blockedBy: null },
    { refCode: "TASK-016", title: "Report export",            status: "in_progress", priority: "p2_medium",   week: "W4", blockedBy: null },
    { refCode: "TASK-019", title: "Staff permission matrix",  status: "in_progress", priority: "p1_high",     week: "W3", blockedBy: null },
  ],
  queue: [
    { refCode: "TASK-021", title: "Offline mode cache layer",    status: "in_progress", priority: "p2_medium", week: "W4", blockedBy: null },
    { refCode: "TASK-022", title: "Audit trail export",          status: "not_started", priority: "p3_low",    week: "W4", blockedBy: null },
    { refCode: "TASK-023", title: "Multi-branch rollout config", status: "not_started", priority: "p2_medium", week: "W4", blockedBy: null },
    { refCode: "TASK-024", title: "API documentation",           status: "not_started", priority: "p3_low",    week: "W4", blockedBy: null },
  ],
  done: [
    { refCode: "TASK-001", title: "Auth system (JWT + sessions)", status: "done", priority: "p0_critical", week: "W1", blockedBy: null },
    { refCode: "TASK-002", title: "Product catalogue CRUD",       status: "done", priority: "p1_high",     week: "W1", blockedBy: null },
    { refCode: "TASK-003", title: "POS terminal UI",              status: "done", priority: "p0_critical", week: "W1", blockedBy: null },
    { refCode: "TASK-004", title: "Sales dashboard",              status: "done", priority: "p1_high",     week: "W2", blockedBy: null },
    { refCode: "TASK-005", title: "Receipt printing (PDF)",       status: "done", priority: "p2_medium",   week: "W2", blockedBy: null },
  ],
};

// ─── Chart primitives ─────────────────────────────────────────────────────────

function DonutRing({ pct, color, size = 72, strokeW = 9 }: { pct: number; color: string; size?: number; strokeW?: number }) {
  const r = (size - strokeW * 2) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="#ebebeb" strokeWidth={strokeW} />
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={strokeW}
        strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
        transform={`rotate(-90 ${cx} ${cx})`} />
    </svg>
  );
}

function BarChart({ bars, h = 72 }: { bars: { label: string; value: number; color: string }[]; h?: number }) {
  const max = Math.max(...bars.map(b => b.value), 1);
  const n = bars.length;
  const vw = 280;
  const bw = Math.floor((vw - (n + 1) * 4) / n);
  return (
    <svg width="100%" viewBox={`0 0 ${vw} ${h + 14}`} preserveAspectRatio="none">
      {bars.map((b, i) => {
        const barH = Math.max((b.value / max) * h, b.value > 0 ? 3 : 0);
        const x = i * (bw + 4) + 4;
        return (
          <g key={i}>
            <rect x={x} y={0} width={bw} height={h} rx={3} fill="#f4f4f5" />
            <rect x={x} y={h - barH} width={bw} height={barH} rx={3} fill={b.color} />
            <text x={x + bw / 2} y={h + 12} textAnchor="middle" fontSize={9} fill="#aaa">{b.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

function AreaSparkline({ points, color, h = 48 }: { points: number[]; color: string; h?: number }) {
  const max = Math.max(...points, 1);
  const w = 280;
  const step = w / (points.length - 1);
  const coords = points.map((p, i) => ({ x: i * step, y: h - (p / max) * (h - 4) }));
  const line = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(" ");
  const area = `${line} L${w},${h} L0,${h} Z`;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={`g${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#g${color.replace("#", "")})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function HorizBar({ label, value, max, color, showVal = true }: { label: string; value: number; max: number; color: string; showVal?: boolean }) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-[11px] text-[#888]">{label}</span>
        {showVal && <span className="text-[11px] font-semibold text-[#1a1a1a]">{value}</span>}
      </div>
      <div className="h-1.5 rounded-full bg-[#f0f0f0] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV = [
  { key: "dashboard",     label: "Dashboard",      Icon: LayoutDashboard },
  { key: "scope-changes", label: "Scope Changes",  Icon: GitBranch },
  { key: "requirements",  label: "Requirements",   Icon: FileCheck },
  { key: "tasks",         label: "Tasks",          Icon: CheckSquare },
];

function Sidebar({ active }: { active: string }) {
  return (
    <aside className="hidden sm:flex w-[196px] shrink-0 flex-col bg-[#f7f7f8] border-r border-[#ebebeb]" style={{ minHeight: "100%" }}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-4 h-12 border-b border-[#ebebeb]">
        <div className="w-6 h-6 rounded-md bg-[#2b7fff] flex items-center justify-center">
          <Lock size={12} color="#fff" strokeWidth={2.5} />
        </div>
        <span className="font-bold text-[13px] text-[#1a1a1a] tracking-tight">ShipLock</span>
      </div>
      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 pt-3">
        <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#bbb]">Project</p>
        {NAV.map(({ key, label, Icon }) => {
          const isActive = key === active;
          return (
            <div key={key} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] cursor-default"
              style={{
                background: isActive ? "#ffffff" : "transparent",
                boxShadow: isActive ? "0 1px 3px rgba(0,0,0,0.07)" : "none",
                color: isActive ? "#1a1a1a" : "#999",
                fontWeight: isActive ? 600 : 400,
              }}>
              <Icon size={13} />
              {label}
            </div>
          );
        })}
        {/* Spacer nav items (decorative) */}
        <div className="pt-4">
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-[#bbb]">Admin</p>
          {["Team", "Billing", "Settings"].map(item => (
            <div key={item} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-[#bbb] cursor-default">{item}</div>
          ))}
        </div>
      </nav>
      {/* Project pill */}
      <div className="px-3 py-3 border-t border-[#ebebeb]">
        <div className="px-3 py-2 rounded-lg bg-white border border-[#ebebeb]">
          <p className="text-[11px] font-semibold text-[#1a1a1a] truncate">Kola POS System</p>
          <p className="text-[10px] text-[#aaa] mt-0.5">MVP · Dec 2025</p>
        </div>
      </div>
    </aside>
  );
}

// ─── Page chrome ──────────────────────────────────────────────────────────────

function PageHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="flex items-center justify-between px-5 sm:px-6 h-12 border-b border-[#ebebeb] shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-semibold text-[#1a1a1a]">{title}</span>
        {sub && <span className="text-[11px] text-[#aaa]">· {sub}</span>}
      </div>
      <div className="flex items-center gap-1.5">
        <div className="w-6 h-6 rounded-full bg-[#e8f0ff] flex items-center justify-center">
          <span className="text-[10px] font-bold text-[#2b7fff]">P</span>
        </div>
      </div>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-[#ebebeb] bg-white ${className}`}>
      {children}
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[10px] font-semibold uppercase tracking-widest text-[#bbb] mb-2">{children}</p>;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

function DashboardSection() {
  const scopeTrendPts = SCOPE_TREND;
  const velocityPts = VELOCITY_TREND;

  return (
    <div className="flex flex-col" style={{ minHeight: "100%" }}>
      <PageHeader title="Dashboard" sub={PROJECT.name} />
      <div className="flex-1 p-4 sm:p-5 space-y-4 overflow-auto">

        {/* Stat row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Completion", value: `${COMPLETION_PCT}%`, color: "#2b7fff", Icon: TrendingUp },
            { label: "Tasks Done", value: `${TASK_STATS.done}/${TASK_STATS.total}`, color: "#1a9c5b", Icon: CheckCircle2 },
            { label: "Blocked", value: TASK_STATS.blocked, color: "#e5484d", Icon: AlertTriangle },
            { label: "Scope Changes", value: SCOPE_CHANGES.length, color: "#c2870a", Icon: GitBranch },
          ].map(({ label, value, color, Icon }) => (
            <Card key={label} className="p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-[#bbb]">{label}</span>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${color}15` }}>
                  <Icon size={12} color={color} />
                </div>
              </div>
              <p className="text-2xl font-bold text-[#1a1a1a] leading-none">{value}</p>
            </Card>
          ))}
        </div>

        {/* Progress + Velocity row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Completion donut */}
          <Card className="p-4">
            <CardLabel>Overall Progress</CardLabel>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <DonutRing pct={COMPLETION_PCT} color="#2b7fff" size={80} strokeW={10} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[15px] font-bold text-[#1a1a1a]">{COMPLETION_PCT}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-2">
                {[
                  { label: "Done", count: TASK_STATS.done, color: "#2b7fff" },
                  { label: "In Progress", count: TASK_STATS.inProgress, color: "#60a5fa" },
                  { label: "Blocked", count: TASK_STATS.blocked, color: "#e5484d" },
                  { label: "Not Started", count: TASK_STATS.notStarted, color: "#d4d4d8" },
                ].map(row => (
                  <div key={row.label} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: row.color }} />
                    <span className="text-[11px] text-[#888] flex-1">{row.label}</span>
                    <span className="text-[11px] font-semibold text-[#1a1a1a] tabular-nums">{row.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Weekly velocity bars */}
          <Card className="p-4">
            <CardLabel>Weekly Velocity</CardLabel>
            <BarChart bars={WEEK_DATA.map(w => ({ label: w.week, value: w.done, color: "#2b7fff" }))} h={64} />
            <div className="flex justify-between mt-2">
              {WEEK_DATA.map(w => (
                <div key={w.week} className="text-center">
                  <p className="text-[10px] text-[#aaa]">{w.done}/{w.total}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Scope creep trend + velocity sparkline */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <CardLabel>Scope Creep Trend</CardLabel>
                <p className="text-xl font-bold text-[#e5484d]">+{SCOPE_CHANGES.length} items</p>
                <p className="text-[11px] text-[#aaa] mt-0.5">Added outside original brief</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-red-50 text-red-500">↑ Growing</span>
            </div>
            <AreaSparkline points={scopeTrendPts} color="#e5484d" h={52} />
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <CardLabel>Delivery Velocity</CardLabel>
                <p className="text-xl font-bold text-[#2b7fff]">{TASK_STATS.done} tasks</p>
                <p className="text-[11px] text-[#aaa] mt-0.5">Shipped last 2 weeks</p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-blue-50 text-blue-500">Active</span>
            </div>
            <AreaSparkline points={velocityPts} color="#2b7fff" h={52} />
          </Card>
        </div>

        {/* Blocked items */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <AlertTriangle size={13} color="#e5484d" />
            <CardLabel>Blocked — Needs Action</CardLabel>
            <span className="ml-auto text-[10px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full font-semibold">{BLOCKED_ITEMS.length}</span>
          </div>
          <div className="space-y-2">
            {BLOCKED_ITEMS.map(item => (
              <div key={item.refCode} className="flex items-center gap-3 p-3 rounded-lg border border-red-100 bg-red-50/50">
                <div className="w-1 self-stretch rounded-full shrink-0" style={{ background: item.level === "red" ? "#e5484d" : "#c2870a" }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#aaa]">{item.refCode}</span>
                    <span className="text-[12px] font-medium text-[#1a1a1a] truncate">{item.title}</span>
                  </div>
                  <p className="text-[11px] text-red-500 mt-0.5">↳ {item.blockedBy}</p>
                </div>
                <span className="text-[11px] font-mono shrink-0" style={{ color: item.level === "red" ? "#e5484d" : "#c2870a" }}>{item.elapsed}</span>
              </div>
            ))}
          </div>
        </Card>

      </div>
    </div>
  );
}

// ─── Scope Changes ────────────────────────────────────────────────────────────

function ScopeChangesSection() {
  const pending  = SCOPE_CHANGES.filter(c => c.status === "pending").length;
  const accepted = SCOPE_CHANGES.filter(c => c.status === "accepted").length;
  const rejected = SCOPE_CHANGES.filter(c => c.status === "rejected").length;
  const deferred = SCOPE_CHANGES.filter(c => c.status === "deferred").length;
  const total = SCOPE_CHANGES.length;

  const impactCounts = {
    high:   SCOPE_CHANGES.filter(c => c.impact === "high").length,
    medium: SCOPE_CHANGES.filter(c => c.impact === "medium").length,
    low:    SCOPE_CHANGES.filter(c => c.impact === "low").length,
  };

  const statusCfg = {
    pending:  { label: "Pending",  color: "#c2870a", bg: "bg-amber-50",  text: "text-amber-700" },
    accepted: { label: "Accepted", color: "#1a9c5b", bg: "bg-green-50",  text: "text-green-700" },
    rejected: { label: "Rejected", color: "#e5484d", bg: "bg-red-50",    text: "text-red-600" },
    deferred: { label: "Deferred", color: "#999",    bg: "bg-zinc-100",  text: "text-zinc-500" },
  };

  return (
    <div className="flex flex-col" style={{ minHeight: "100%" }}>
      <PageHeader title="Scope Changes" sub={`${total} total · ${pending} pending`} />
      <div className="flex-1 p-4 sm:p-5 space-y-4 overflow-auto">

        {/* Stat tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total",    value: total,    color: "#2b7fff" },
            { label: "Pending",  value: pending,  color: "#c2870a" },
            { label: "Accepted", value: accepted, color: "#1a9c5b" },
            { label: "Rejected", value: rejected, color: "#e5484d" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="p-4">
              <p className="text-[10px] font-semibold uppercase tracking-widest mb-2" style={{ color: "#bbb" }}>{label}</p>
              <div className="flex items-end gap-2">
                <p className="text-2xl font-bold text-[#1a1a1a]">{value}</p>
                <DonutRing pct={total > 0 ? (value / total) * 100 : 0} color={color} size={32} strokeW={5} />
              </div>
            </Card>
          ))}
        </div>

        {/* Status breakdown + Impact bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="p-4">
            <CardLabel>Status Breakdown</CardLabel>
            {/* Stacked horizontal bar */}
            <div className="h-4 rounded-full overflow-hidden flex mb-3 gap-px">
              {([
                { count: pending,  color: "#c2870a" },
                { count: accepted, color: "#1a9c5b" },
                { count: rejected, color: "#e5484d" },
                { count: deferred, color: "#d4d4d8" },
              ] as { count: number; color: string }[]).filter(s => s.count > 0).map((s, i) => (
                <div key={i} className="h-full" style={{ width: `${(s.count / total) * 100}%`, background: s.color }} />
              ))}
            </div>
            <div className="space-y-2">
              {(["pending", "accepted", "rejected", "deferred"] as const).map(key => {
                const counts = { pending, accepted, rejected, deferred };
                const cfg = statusCfg[key];
                return (
                  <HorizBar key={key} label={cfg.label} value={counts[key]} max={total} color={cfg.color} />
                );
              })}
            </div>
          </Card>

          <Card className="p-4">
            <CardLabel>Impact Distribution</CardLabel>
            <div className="flex items-center gap-4 mb-3">
              <div className="relative shrink-0">
                <DonutRing pct={(impactCounts.high / total) * 100} color="#e5484d" size={64} strokeW={8} />
              </div>
              <div className="flex-1 space-y-2">
                <HorizBar label="High impact" value={impactCounts.high} max={total} color="#e5484d" />
                <HorizBar label="Medium" value={impactCounts.medium} max={total} color="#c2870a" />
                <HorizBar label="Low" value={impactCounts.low} max={total} color="#1a9c5b" />
              </div>
            </div>
            <AreaSparkline points={SCOPE_TREND} color="#e5484d" h={44} />
            <p className="text-[10px] text-[#aaa] mt-1.5">Cumulative scope growth over project</p>
          </Card>
        </div>

        {/* Change cards */}
        <div className="space-y-2">
          {SCOPE_CHANGES.map(change => {
            const cfg = statusCfg[change.status as keyof typeof statusCfg];
            const impactColor = { high: "text-red-600 bg-red-50", medium: "text-amber-700 bg-amber-50", low: "text-zinc-500 bg-zinc-100" }[change.impact];
            return (
              <Card key={change.id} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.text}`}>{cfg.label}</span>
                      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${impactColor}`}>{change.impact} impact</span>
                      <span className="text-[10px] text-[#bbb] capitalize">{change.source.replace("_", " ")}</span>
                    </div>
                    <p className="text-[13px] font-semibold text-[#1a1a1a]">{change.title}</p>
                  </div>
                  <span className="text-[10px] text-[#bbb] shrink-0 pt-0.5">{change.createdAt}</span>
                </div>
              </Card>
            );
          })}
        </div>

      </div>
    </div>
  );
}

// ─── Requirements ─────────────────────────────────────────────────────────────

function RequirementsSection() {
  const mvpCount      = REQUIREMENTS.filter(r => r.classification === "mvp").length;
  const approvedCount = REQUIREMENTS.filter(r => r.status === "approved").length;
  const pendingCount  = REQUIREMENTS.filter(r => r.status === "pending_approval").length;
  const disputedCount = REQUIREMENTS.filter(r => r.status === "disputed").length;
  const draftCount    = REQUIREMENTS.filter(r => r.status === "draft").length;
  const total         = REQUIREMENTS.length;

  const clsCfg = {
    mvp:          { label: "MVP",         color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
    post_mvp:     { label: "Post-MVP",    color: "text-zinc-500 bg-zinc-100 border-zinc-200" },
    out_of_scope: { label: "Out of Scope",color: "text-red-600 bg-red-50 border-red-200" },
  };
  const stCfg = {
    draft:            { label: "Draft",         color: "text-zinc-500 bg-zinc-100" },
    pending_approval: { label: "Pending",        color: "text-amber-700 bg-amber-50" },
    approved:         { label: "Approved",       color: "text-green-600 bg-green-50" },
    disputed:         { label: "Disputed",       color: "text-orange-600 bg-orange-50" },
  };

  return (
    <div className="flex flex-col" style={{ minHeight: "100%" }}>
      <PageHeader title="Requirements" sub={`${total} total`} />
      <div className="flex-1 p-4 sm:p-5 space-y-4 overflow-auto">

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { label: "MVP Scope",  value: mvpCount,      color: "#2b7fff" },
            { label: "Approved",   value: approvedCount, color: "#1a9c5b" },
            { label: "Pending",    value: pendingCount,  color: "#c2870a" },
            { label: "Disputed",   value: disputedCount, color: "#e5484d" },
          ].map(({ label, value, color }) => (
            <Card key={label} className="p-3 flex items-center gap-3">
              <DonutRing pct={(value / total) * 100} color={color} size={36} strokeW={5} />
              <div>
                <p className="text-[18px] font-bold text-[#1a1a1a] leading-none">{value}</p>
                <p className="text-[10px] text-[#aaa] mt-0.5">{label}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Approval rate + Classification */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="p-4">
            <CardLabel>Approval Rate</CardLabel>
            <div className="flex items-center gap-4">
              <div className="relative shrink-0">
                <DonutRing pct={(approvedCount / total) * 100} color="#1a9c5b" size={72} strokeW={9} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[13px] font-bold text-[#1a1a1a]">{Math.round((approvedCount / total) * 100)}%</span>
                </div>
              </div>
              <div className="flex-1 space-y-2.5">
                <HorizBar label="Approved" value={approvedCount} max={total} color="#1a9c5b" />
                <HorizBar label="Pending"  value={pendingCount}  max={total} color="#c2870a" />
                <HorizBar label="Draft"    value={draftCount}    max={total} color="#d4d4d8" />
                <HorizBar label="Disputed" value={disputedCount} max={total} color="#e5484d" />
              </div>
            </div>
          </Card>

          <Card className="p-4">
            <CardLabel>By Classification</CardLabel>
            <BarChart bars={[
              { label: "MVP",       value: mvpCount,      color: "#2b7fff" },
              { label: "Post-MVP",  value: REQUIREMENTS.filter(r => r.classification === "post_mvp").length,     color: "#94a3b8" },
              { label: "OOS",       value: REQUIREMENTS.filter(r => r.classification === "out_of_scope").length, color: "#e5484d" },
            ]} h={64} />
            <div className="flex gap-3 mt-2">
              {[
                { label: "MVP", color: "#2b7fff" },
                { label: "Post-MVP", color: "#94a3b8" },
                { label: "Out of Scope", color: "#e5484d" },
              ].map(l => (
                <div key={l.label} className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                  <span className="text-[10px] text-[#aaa]">{l.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Table */}
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#ebebeb] bg-[#fafafa]">
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-[#bbb] uppercase tracking-wide">Ref</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-[#bbb] uppercase tracking-wide">Requirement</th>
                <th className="hidden sm:table-cell text-left px-4 py-2.5 text-[10px] font-semibold text-[#bbb] uppercase tracking-wide">Scope</th>
                <th className="text-left px-4 py-2.5 text-[10px] font-semibold text-[#bbb] uppercase tracking-wide">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f4f4f5]">
              {REQUIREMENTS.map(req => {
                const cls = clsCfg[req.classification as keyof typeof clsCfg];
                const st  = stCfg[req.status as keyof typeof stCfg];
                const stLabel = req.autoApproved ? "Auto-Approved" : st.label;
                return (
                  <tr key={req.refCode}>
                    <td className="px-4 py-2.5 font-mono text-[10px] text-[#bbb]">{req.refCode}</td>
                    <td className="px-4 py-2.5 text-[12px] font-medium text-[#1a1a1a]">{req.title}</td>
                    <td className="hidden sm:table-cell px-4 py-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded border font-medium ${cls.color}`}>{cls.label}</span>
                    </td>
                    <td className="px-4 py-2.5">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.color}`}>{stLabel}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>

      </div>
    </div>
  );
}

// ─── Tasks ────────────────────────────────────────────────────────────────────

function TasksSection() {
  const priorityDist = {
    p0_critical: [...TASKS_DATA.attention, ...TASKS_DATA.queue, ...TASKS_DATA.done].filter(t => t.priority === "p0_critical").length,
    p1_high:     [...TASKS_DATA.attention, ...TASKS_DATA.queue, ...TASKS_DATA.done].filter(t => t.priority === "p1_high").length,
    p2_medium:   [...TASKS_DATA.attention, ...TASKS_DATA.queue, ...TASKS_DATA.done].filter(t => t.priority === "p2_medium").length,
    p3_low:      [...TASKS_DATA.attention, ...TASKS_DATA.queue, ...TASKS_DATA.done].filter(t => t.priority === "p3_low").length,
  };

  const statusCfg = {
    not_started: { Icon: CircleMinus,   color: "#aaa",    border: "border-zinc-200",  bg: "bg-zinc-50"  },
    in_progress: { Icon: CircleDot,     color: "#2b7fff", border: "border-blue-200",  bg: "bg-blue-50/50" },
    blocked:     { Icon: AlertTriangle, color: "#e5484d", border: "border-red-200",   bg: "bg-red-50/50" },
    done:        { Icon: CircleCheck,   color: "#1a9c5b", border: "border-green-200", bg: "bg-green-50/50" },
  };
  const priorityCfg = {
    p0_critical: { label: "P0", color: "text-red-600 bg-red-50 border border-red-200" },
    p1_high:     { label: "P1", color: "text-orange-600 bg-orange-50 border border-orange-200" },
    p2_medium:   { label: "P2", color: "text-amber-700 bg-amber-50 border border-amber-200" },
    p3_low:      { label: "P3", color: "text-zinc-500 bg-zinc-100 border border-zinc-200" },
  };

  const columns = [
    { key: "attention", label: "Needs Attention", tasks: TASKS_DATA.attention, accent: "#e5484d" },
    { key: "queue",     label: "Queue",           tasks: TASKS_DATA.queue,     accent: "#2b7fff" },
    { key: "done",      label: "Finished",        tasks: TASKS_DATA.done,      accent: "#1a9c5b" },
  ];

  return (
    <div className="flex flex-col" style={{ minHeight: "100%" }}>
      <PageHeader title="Tasks" sub={`${TASK_STATS.done}/${TASK_STATS.total} complete`} />
      <div className="flex-1 p-4 sm:p-5 space-y-4 overflow-auto">

        {/* Progress bar + stats row */}
        <Card className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[#1a1a1a]">{COMPLETION_PCT}% complete</span>
            <span className="text-[11px] text-[#aaa]">{TASK_STATS.done} of {TASK_STATS.total} tasks</span>
          </div>
          <div className="h-2 rounded-full bg-[#f0f0f0] overflow-hidden mb-4">
            <div className="h-full rounded-full bg-[#2b7fff]" style={{ width: `${COMPLETION_PCT}%` }} />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Done",        value: TASK_STATS.done,        color: "#1a9c5b" },
              { label: "In Progress", value: TASK_STATS.inProgress,  color: "#2b7fff" },
              { label: "Blocked",     value: TASK_STATS.blocked,     color: "#e5484d" },
              { label: "Not Started", value: TASK_STATS.notStarted,  color: "#d4d4d8" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ background: color }} />
                <span className="text-[11px] text-[#888] flex-1">{label}</span>
                <span className="text-[11px] font-bold text-[#1a1a1a] tabular-nums">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Velocity + Priority */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="p-4">
            <CardLabel>Sprint Velocity</CardLabel>
            <BarChart bars={WEEK_DATA.map(w => ({ label: w.week, value: w.done, color: w.done >= w.total * 0.8 ? "#1a9c5b" : w.done > 0 ? "#2b7fff" : "#f0f0f0" }))} h={64} />
          </Card>

          <Card className="p-4">
            <CardLabel>Priority Distribution</CardLabel>
            <div className="flex items-center gap-4">
              <DonutRing pct={(priorityDist.p0_critical / TASK_STATS.total) * 100} color="#e5484d" size={64} strokeW={8} />
              <div className="flex-1 space-y-2">
                <HorizBar label="P0 Critical" value={priorityDist.p0_critical} max={TASK_STATS.total} color="#e5484d" />
                <HorizBar label="P1 High"     value={priorityDist.p1_high}     max={TASK_STATS.total} color="#c2870a" />
                <HorizBar label="P2 Medium"   value={priorityDist.p2_medium}   max={TASK_STATS.total} color="#2b7fff" />
                <HorizBar label="P3 Low"      value={priorityDist.p3_low}      max={TASK_STATS.total} color="#d4d4d8" />
              </div>
            </div>
          </Card>
        </div>

        {/* Kanban */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-start">
          {columns.map(col => (
            <Card key={col.key} className="overflow-hidden">
              <div className="px-4 py-2.5 border-b border-[#ebebeb] flex items-center justify-between" style={{ borderTop: `3px solid ${col.accent}` }}>
                <span className="text-[12px] font-semibold text-[#1a1a1a]">{col.label}</span>
                <span className="text-[10px] text-[#bbb] bg-[#f4f4f5] px-2 py-0.5 rounded-full">{col.tasks.length}</span>
              </div>
              <div className="p-3 space-y-2">
                {col.tasks.map(task => {
                  const scfg = statusCfg[task.status as keyof typeof statusCfg] ?? statusCfg.not_started;
                  const pcfg = priorityCfg[task.priority as keyof typeof priorityCfg] ?? priorityCfg.p3_low;
                  const { Icon } = scfg;
                  return (
                    <div key={task.refCode} className={`p-2.5 rounded-lg border ${scfg.border} ${scfg.bg}`}>
                      <div className="flex items-start gap-2">
                        <Icon size={12} className="mt-0.5 shrink-0" color={scfg.color} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-mono text-[9px] text-[#bbb]">{task.refCode}</span>
                            <span className={`text-[9px] px-1 py-px rounded font-semibold ${pcfg.color}`}>{pcfg.label}</span>
                          </div>
                          <p className="text-[11px] font-medium text-[#1a1a1a] leading-snug">{task.title}</p>
                          {task.blockedBy && <p className="text-[10px] text-red-500 mt-0.5">↳ {task.blockedBy}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
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
  const { section = "dashboard" } = await searchParams;

  const sections: Record<string, React.ReactNode> = {
    dashboard:       <DashboardSection />,
    "scope-changes": <ScopeChangesSection />,
    requirements:    <RequirementsSection />,
    tasks:           <TasksSection />,
  };

  const content = sections[section] ?? <DashboardSection />;

  return (
    <div className="flex min-h-screen bg-white overflow-hidden">
      <Sidebar active={section} />
      <div className="flex-1 flex flex-col bg-white">
        {content}
      </div>
    </div>
  );
}
