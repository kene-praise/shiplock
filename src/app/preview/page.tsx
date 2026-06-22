import { AlertTriangle, CheckCircle2, Clock, TrendingUp, Zap, Layers, CircleCheck, CircleDot, CircleMinus } from "lucide-react";

// ─── Demo data ────────────────────────────────────────────────────────────────

const PROJECT = { name: "Kola POS System", deadline: "Dec 15, 2025" };

const TASK_STATS = { total: 24, done: 14, inProgress: 4, blocked: 2, notStarted: 4 };
const COMPLETION_PCT = Math.round((TASK_STATS.done / TASK_STATS.total) * 100);

const BLOCKED_ITEMS = [
  { refCode: "TASK-007", title: "Payment gateway webhook", blockedBy: "Paystack API credentials not provided", updatedAt: "2h ago" },
  { refCode: "TASK-012", title: "SMS notification delivery", blockedBy: "Provider rate limit — awaiting upgrade", updatedAt: "5h ago" },
];

const WEEK_DATA = [
  { week: "W1", done: 6, total: 6, pct: 100 },
  { week: "W2", done: 5, total: 6, pct: 83 },
  { week: "W3", done: 3, total: 6, pct: 50 },
  { week: "W4", done: 0, total: 6, pct: 0 },
];

const SCOPE_CHANGES = [
  { id: "1", title: "Add loyalty points engine", description: "Client wants a points-per-purchase system with redemption at checkout. Estimate: 3–4 days.", source: "client_request", status: "pending",  impact: "medium", createdAt: "1d ago" },
  { id: "2", title: "Bulk product import via CSV", description: "Allow staff to upload a CSV of products instead of manual entry. Estimate: 1 day.", source: "stakeholder",    status: "accepted", impact: "low",    createdAt: "3d ago" },
  { id: "3", title: "Multi-currency pricing", description: "Support USD and GBP alongside NGN. Requires exchange-rate API and tax recalculations.", source: "client_request", status: "rejected", impact: "high",   createdAt: "5d ago" },
  { id: "4", title: "WhatsApp receipt delivery", description: "Send receipts via WhatsApp Business API instead of SMS only.", source: "client_request", status: "deferred", impact: "low",    createdAt: "6d ago" },
];

const REQUIREMENTS = [
  { refCode: "REQ-001", title: "POS terminal with offline mode",     classification: "mvp",          status: "approved",         autoApproved: false },
  { refCode: "REQ-002", title: "Real-time inventory sync",           classification: "mvp",          status: "approved",         autoApproved: false },
  { refCode: "REQ-003", title: "Staff role management (3 tiers)",    classification: "mvp",          status: "approved",         autoApproved: true  },
  { refCode: "REQ-004", title: "Sales analytics dashboard",          classification: "mvp",          status: "approved",         autoApproved: false },
  { refCode: "REQ-005", title: "Customer receipt history",           classification: "mvp",          status: "pending_approval", autoApproved: false },
  { refCode: "REQ-006", title: "Paystack payment gateway",           classification: "mvp",          status: "approved",         autoApproved: false },
  { refCode: "REQ-007", title: "Audit log export (CSV)",             classification: "mvp",          status: "pending_approval", autoApproved: false },
  { refCode: "REQ-008", title: "Loyalty points engine",              classification: "post_mvp",     status: "draft",            autoApproved: false },
  { refCode: "REQ-009", title: "WhatsApp notifications",             classification: "post_mvp",     status: "draft",            autoApproved: false },
  { refCode: "REQ-010", title: "Multi-currency pricing",             classification: "out_of_scope", status: "disputed",         autoApproved: false },
];

const TASKS_DATA = {
  attention: [
    { refCode: "TASK-007", title: "Payment gateway webhook",     status: "blocked",     priority: "p0_critical", week: "W3", blockedBy: "Paystack credentials" },
    { refCode: "TASK-012", title: "SMS notification delivery",   status: "blocked",     priority: "p1_high",     week: "W3", blockedBy: "Provider rate limit" },
    { refCode: "TASK-014", title: "Inventory sync module",       status: "in_progress", priority: "p1_high",     week: "W3", blockedBy: null },
    { refCode: "TASK-016", title: "Report export",               status: "in_progress", priority: "p2_medium",   week: "W4", blockedBy: null },
    { refCode: "TASK-019", title: "Staff permission matrix",     status: "in_progress", priority: "p1_high",     week: "W3", blockedBy: null },
    { refCode: "TASK-021", title: "Offline mode cache layer",    status: "in_progress", priority: "p2_medium",   week: "W4", blockedBy: null },
  ],
  queue: [
    { refCode: "TASK-022", title: "Audit trail export",          status: "not_started", priority: "p3_low",    week: "W4", blockedBy: null },
    { refCode: "TASK-023", title: "Multi-branch rollout config", status: "not_started", priority: "p2_medium", week: "W4", blockedBy: null },
    { refCode: "TASK-024", title: "API documentation",           status: "not_started", priority: "p3_low",    week: "W4", blockedBy: null },
    { refCode: "TASK-025", title: "Load testing (500 TPS)",      status: "not_started", priority: "p3_low",    week: "W4", blockedBy: null },
  ],
  done: [
    { refCode: "TASK-001", title: "Auth system (JWT + sessions)", status: "done", priority: "p0_critical", week: "W1", blockedBy: null },
    { refCode: "TASK-002", title: "Product catalogue CRUD",       status: "done", priority: "p1_high",     week: "W1", blockedBy: null },
    { refCode: "TASK-003", title: "POS terminal UI",              status: "done", priority: "p0_critical", week: "W1", blockedBy: null },
    { refCode: "TASK-004", title: "Sales dashboard",              status: "done", priority: "p1_high",     week: "W2", blockedBy: null },
    { refCode: "TASK-005", title: "Receipt printing (PDF)",       status: "done", priority: "p2_medium",   week: "W2", blockedBy: null },
    { refCode: "TASK-006", title: "Customer ledger",              status: "done", priority: "p1_high",     week: "W2", blockedBy: null },
  ],
};

// ─── Shared UI ────────────────────────────────────────────────────────────────

function Badge({ label, color }: { label: string; color: string }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{label}</span>;
}

// ─── Sections ─────────────────────────────────────────────────────────────────

function DashboardSection() {
  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (COMPLETION_PCT / 100) * circumference;
  const onTrack = TASK_STATS.blocked === 0 && COMPLETION_PCT >= 25;

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-foreground">{PROJECT.name}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">MVP deadline: {PROJECT.deadline}</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Progress ring — 2×2 */}
        <div className="col-span-2 row-span-2 rounded-2xl border border-border bg-card p-6 flex flex-col justify-between min-h-[200px]">
          <div>
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Overall Progress</p>
            <p className="text-sm text-muted-foreground mt-0.5">{TASK_STATS.done} of {TASK_STATS.total} tasks complete</p>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative shrink-0">
              <svg width="88" height="88" viewBox="0 0 88 88">
                <circle cx="44" cy="44" r="36" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle cx="44" cy="44" r="36" fill="none" stroke="var(--primary)" strokeWidth="8"
                  strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={strokeDashoffset}
                  transform="rotate(-90 44 44)" />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-foreground">{COMPLETION_PCT}%</span>
              </div>
            </div>
            <div className="space-y-2 flex-1">
              {[
                { label: "Done", count: TASK_STATS.done, color: "bg-primary" },
                { label: "In progress", count: TASK_STATS.inProgress, color: "bg-blue-300" },
                { label: "Blocked", count: TASK_STATS.blocked, color: "bg-red-400" },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${row.color}`} />
                  <span className="text-xs text-muted-foreground">{row.label}</span>
                  <span className="ml-auto text-xs font-semibold text-foreground">{row.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit ${onTrack ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"}`}>
            {onTrack ? <Zap className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
            {onTrack ? "On track" : "Needs attention"}
          </div>
        </div>

        {/* Stat tiles */}
        {[
          { label: "Total Tasks",   value: TASK_STATS.total,      icon: TrendingUp,  iconBg: "bg-primary/10",  iconColor: "text-primary" },
          { label: "Requirements",  value: "6 / 10",              icon: CheckCircle2, iconBg: "bg-green-50",   iconColor: "text-green-600" },
          { label: "Pending",       value: 2,                     icon: Clock,       iconBg: "bg-yellow-50",   iconColor: "text-yellow-700" },
          { label: "Active Pings",  value: 3,                     icon: Zap,         iconBg: "bg-primary/10",  iconColor: "text-primary" },
        ].map((tile) => (
          <div key={tile.label} className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{tile.label}</span>
              <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${tile.iconBg}`}>
                <tile.icon className={`h-3.5 w-3.5 ${tile.iconColor}`} />
              </div>
            </div>
            <p className="text-3xl font-bold text-foreground mt-3">{tile.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-4">
        {/* Blocked items */}
        <div className="col-span-2 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Blocked Items
            <span className="ml-1 text-[10px] bg-red-50 text-red-600 px-1.5 py-0.5 rounded-full font-semibold">{BLOCKED_ITEMS.length}</span>
          </h2>
          <div className="space-y-2">
            {BLOCKED_ITEMS.map((item) => (
              <div key={item.refCode} className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100">
                <div className="w-1 self-stretch rounded-full bg-red-400 shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">{item.refCode}</span>
                    <span className="text-sm font-medium text-foreground truncate">{item.title}</span>
                  </div>
                  <p className="text-xs text-red-600 mt-0.5">↳ {item.blockedBy}</p>
                </div>
                <span className="text-[10px] text-muted-foreground shrink-0 pt-0.5">{item.updatedAt}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly progress */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Weekly Progress</h2>
          <div className="space-y-4">
            {WEEK_DATA.map((w) => (
              <div key={w.week}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-semibold text-foreground">{w.week}</span>
                  <span className="text-muted-foreground tabular-nums">{w.done}/{w.total}</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${w.pct}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 text-right">{w.pct}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ScopeChangesSection() {
  const statusConfig = {
    pending:  { label: "Pending",  color: "text-yellow-700 bg-yellow-500/10" },
    accepted: { label: "Accepted", color: "text-green-600 bg-green-500/10" },
    rejected: { label: "Rejected", color: "text-red-600 bg-red-500/10" },
    deferred: { label: "Deferred", color: "text-zinc-500 bg-zinc-500/10" },
  };
  const pending = SCOPE_CHANGES.filter((c) => c.status === "pending").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Scope Changes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{SCOPE_CHANGES.length} total · {pending} pending decision</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md">
          Log Change
        </div>
      </div>

      <div className="space-y-3">
        {SCOPE_CHANGES.map((change) => {
          const cfg = statusConfig[change.status as keyof typeof statusConfig];
          const impactColor = { high: "text-red-600 bg-red-50", medium: "text-yellow-700 bg-yellow-50", low: "text-zinc-500 bg-zinc-100" }[change.impact];
          return (
            <div key={change.id} className="block p-4 rounded-xl border border-border bg-card">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Badge label={cfg.label} color={cfg.color} />
                    <span className="text-xs text-muted-foreground capitalize">{change.source.replace("_", " ")}</span>
                    <Badge label={`${change.impact} impact`} color={`text-xs px-1.5 py-0.5 rounded font-medium ${impactColor}`} />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{change.title}</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{change.description}</p>
                </div>
                <span className="text-[11px] text-muted-foreground shrink-0 pt-0.5">{change.createdAt}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RequirementsSection() {
  const classificationColors = {
    mvp:          "bg-indigo-50 text-indigo-600 border-indigo-200",
    post_mvp:     "bg-zinc-100 text-zinc-500 border-zinc-200",
    out_of_scope: "bg-red-50 text-red-600 border-red-200",
  };
  const classificationLabel = { mvp: "MVP", post_mvp: "Post-MVP", out_of_scope: "Out of Scope" };
  const statusColors = {
    draft:            "bg-zinc-100 text-zinc-500",
    pending_approval: "bg-yellow-50 text-yellow-700",
    approved:         "bg-green-50 text-green-600",
    disputed:         "bg-orange-50 text-orange-600",
  };

  const mvpCount      = REQUIREMENTS.filter((r) => r.classification === "mvp").length;
  const approvedCount = REQUIREMENTS.filter((r) => r.status === "approved").length;
  const pendingCount  = REQUIREMENTS.filter((r) => r.status === "pending_approval").length;
  const disputedCount = REQUIREMENTS.filter((r) => r.status === "disputed").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Requirements</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{REQUIREMENTS.length} total requirements</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-sm border border-border bg-card px-3 py-1.5 rounded-lg">Import</div>
          <div className="flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-lg">Add</div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Layers,      iconBg: "bg-primary/10",  iconColor: "text-primary",     value: mvpCount,      label: "MVP scope" },
          { icon: CheckCircle2,iconBg: "bg-green-50",    iconColor: "text-green-600",   value: approvedCount, label: "Approved" },
          { icon: Clock,       iconBg: "bg-yellow-50",   iconColor: "text-yellow-700",  value: pendingCount,  label: "Pending" },
          { icon: AlertTriangle,iconBg:"bg-orange-50",   iconColor: "text-orange-600",  value: disputedCount, label: "Disputed" },
        ].map((tile) => (
          <div key={tile.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg ${tile.iconBg} flex items-center justify-center shrink-0`}>
              <tile.icon className={`h-4 w-4 ${tile.iconColor}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground leading-none">{tile.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{tile.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ref</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Requirement</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Scope</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {REQUIREMENTS.map((req) => {
              const cls = classificationColors[req.classification as keyof typeof classificationColors];
              const clsLabel = classificationLabel[req.classification as keyof typeof classificationLabel];
              const stColor = statusColors[req.status as keyof typeof statusColors];
              const stLabel = req.status === "pending_approval" ? "Pending" : req.status === "approved" && req.autoApproved ? "Auto-Approved" : req.status.charAt(0).toUpperCase() + req.status.slice(1);
              return (
                <tr key={req.refCode} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{req.refCode}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{req.title}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-md border font-medium ${cls}`}>{clsLabel}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${stColor}`}>{stLabel}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function TasksSection() {
  const statusConfig = {
    not_started: { label: "Not Started", color: "text-zinc-500",  bg: "bg-zinc-500/10",  icon: CircleMinus,   headerBg: "bg-zinc-50",  border: "border-zinc-200" },
    in_progress: { label: "In Progress", color: "text-blue-600",  bg: "bg-blue-500/10",  icon: CircleDot,     headerBg: "bg-blue-50",  border: "border-blue-200" },
    blocked:     { label: "Blocked",     color: "text-red-600",   bg: "bg-red-500/10",   icon: AlertTriangle, headerBg: "bg-red-50",   border: "border-red-200" },
    done:        { label: "Done",        color: "text-green-600", bg: "bg-green-500/10", icon: CircleCheck,   headerBg: "bg-green-50", border: "border-green-200" },
  };
  const priorityConfig = {
    p0_critical: { label: "P0", color: "text-red-600 bg-red-50 border border-red-200" },
    p1_high:     { label: "P1", color: "text-orange-600 bg-orange-50 border border-orange-200" },
    p2_medium:   { label: "P2", color: "text-yellow-700 bg-yellow-50 border border-yellow-200" },
    p3_low:      { label: "P3", color: "text-zinc-500 bg-zinc-100 border border-zinc-200" },
  };

  const pct = COMPLETION_PCT;
  const columns = [
    { key: "attention", label: "Needs Attention", tasks: TASKS_DATA.attention },
    { key: "queue",     label: "Queue",            tasks: TASKS_DATA.queue },
    { key: "done",      label: "Finished",         tasks: TASKS_DATA.done },
  ];

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Tasks</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{TASK_STATS.done}/{TASK_STATS.total} complete · {pct}%</p>
        </div>
        <div className="flex items-center gap-1.5 text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-lg">New Task</div>
      </div>

      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>

      <div className="grid grid-cols-3 gap-4 items-start">
        {columns.map((col) => (
          <div key={col.key} className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="px-4 py-3 border-b border-border flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">{col.label}</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{col.tasks.length}</span>
            </div>
            <div className="p-3 space-y-2">
              {col.tasks.map((task) => {
                const sKey = task.status as keyof typeof statusConfig;
                const scfg = statusConfig[sKey] ?? statusConfig.not_started;
                const pKey = task.priority as keyof typeof priorityConfig;
                const pcfg = priorityConfig[pKey] ?? priorityConfig.p3_low;
                const Icon = scfg.icon;
                return (
                  <div key={task.refCode} className={`p-3 rounded-lg border ${scfg.border} ${scfg.headerBg}`}>
                    <div className="flex items-start gap-2">
                      <Icon className={`h-3.5 w-3.5 mt-0.5 shrink-0 ${scfg.color}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="font-mono text-[10px] text-muted-foreground">{task.refCode}</span>
                          <span className={`text-[10px] px-1.5 py-px rounded font-semibold ${pcfg.color}`}>{pcfg.label}</span>
                        </div>
                        <p className="text-xs font-medium text-foreground leading-snug">{task.title}</p>
                        {task.blockedBy && <p className="text-[10px] text-red-600 mt-0.5">↳ {task.blockedBy}</p>}
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">{task.week}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface PreviewPageProps {
  searchParams: Promise<{ section?: string }>;
}

export default async function PreviewPage({ searchParams }: PreviewPageProps) {
  const { section } = await searchParams;

  const sections: Record<string, React.ReactNode> = {
    dashboard:     <DashboardSection />,
    "scope-changes": <ScopeChangesSection />,
    requirements:  <RequirementsSection />,
    tasks:         <TasksSection />,
  };

  const content = sections[section ?? "dashboard"] ?? <DashboardSection />;

  return (
    <div className="min-h-screen bg-background">
      {content}
    </div>
  );
}
