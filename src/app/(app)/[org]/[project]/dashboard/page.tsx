import { db } from "@/db";
import { projects, tasks, requirements, clientPings } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { AlertTriangle, CheckCircle2, Clock, TrendingUp } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface DashboardPageProps {
  params: Promise<{ org: string; project: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { project } = await params;

  const [projectData] = await db
    .select()
    .from(projects)
    .where(eq(projects.slug, project))
    .limit(1);

  if (!projectData) {
    return <div className="p-6 text-muted-foreground text-sm">Project not found.</div>;
  }

  const projectId = projectData.id;

  // Task stats
  const taskStats = await db
    .select({
      status: tasks.status,
      count: count(),
    })
    .from(tasks)
    .where(eq(tasks.projectId, projectId))
    .groupBy(tasks.status);

  const totalTasks = taskStats.reduce((s, r) => s + Number(r.count), 0);
  const doneTasks = taskStats.find((r) => r.status === "done")?.count ?? 0;
  const blockedTasks = taskStats.find((r) => r.status === "blocked")?.count ?? 0;

  // Requirement stats
  const reqStats = await db
    .select({ status: requirements.status, count: count() })
    .from(requirements)
    .where(eq(requirements.projectId, projectId))
    .groupBy(requirements.status);

  const pendingApprovals = reqStats.find((r) => r.status === "pending_approval")?.count ?? 0;
  const approvedReqs = reqStats.find((r) => r.status === "approved")?.count ?? 0;

  // Blocked tasks detail
  const blockedItems = await db
    .select({
      id: tasks.id,
      refCode: tasks.refCode,
      title: tasks.title,
      blockedBy: tasks.blockedBy,
      blockedReason: tasks.blockedReason,
      updatedAt: tasks.updatedAt,
    })
    .from(tasks)
    .where(and(eq(tasks.projectId, projectId), eq(tasks.status, "blocked")))
    .orderBy(tasks.updatedAt)
    .limit(10);

  // Active client pings
  const activePings = await db
    .select()
    .from(clientPings)
    .where(and(eq(clientPings.projectId, projectId), eq(clientPings.status, "pending")))
    .orderBy(clientPings.deadline)
    .limit(5);

  // Weekly task breakdown
  const weeklyStats = await db
    .select({
      week: tasks.week,
      status: tasks.status,
      count: count(),
    })
    .from(tasks)
    .where(eq(tasks.projectId, projectId))
    .groupBy(tasks.week, tasks.status);

  const weeks = ["W1", "W2", "W3", "W4"];
  const weekData = weeks.map((w) => {
    const wTasks = weeklyStats.filter((r) => r.week === w);
    const total = wTasks.reduce((s, r) => s + Number(r.count), 0);
    const done = wTasks.find((r) => r.status === "done")?.count ?? 0;
    const pct = total > 0 ? Math.round((Number(done) / total) * 100) : 0;
    return { week: w, total, done: Number(done), pct };
  });

  const completionPct = totalTasks > 0 ? Math.round((Number(doneTasks) / totalTasks) * 100) : 0;
  const onTrack = Number(blockedTasks) === 0 && completionPct >= 25;

  return (
    <div className="p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-xl font-bold text-foreground">{projectData.name}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {projectData.mvpDeadline ? `MVP deadline: ${projectData.mvpDeadline}` : "No deadline set"}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Tasks" value={totalTasks} icon={TrendingUp} />
        <StatCard label="Done" value={Number(doneTasks)} icon={CheckCircle2} iconColor="text-green-400" valueColor="text-green-400" />
        <StatCard
          label="Blocked"
          value={Number(blockedTasks)}
          icon={AlertTriangle}
          iconColor={Number(blockedTasks) > 0 ? "text-red-400" : "text-muted-foreground"}
          valueColor={Number(blockedTasks) > 0 ? "text-red-400" : undefined}
        />
        <StatCard
          label="On Track"
          value={onTrack ? "Yes" : "No"}
          icon={CheckCircle2}
          valueColor={onTrack ? "text-green-400" : "text-red-400"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Blocked items */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-4">
          <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            Blocked Items
            {blockedItems.length > 0 && (
              <span className="ml-1 text-xs bg-red-950 text-red-400 px-1.5 py-0.5 rounded-full font-medium">
                {blockedItems.length}
              </span>
            )}
          </h2>
          {blockedItems.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No blocked items. Great work.</p>
          ) : (
            <div className="space-y-2">
              {blockedItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-3 rounded-lg bg-red-950/20 border border-red-900/30"
                >
                  <div className="w-1 self-stretch rounded-full bg-red-500 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="ref-code">{item.refCode}</span>
                      <span className="text-sm font-medium text-foreground truncate">{item.title}</span>
                    </div>
                    {item.blockedBy && (
                      <p className="text-xs text-red-400 mt-0.5">
                        Blocked by: <span className="font-medium">{item.blockedBy}</span>
                      </p>
                    )}
                    {item.blockedReason && (
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{item.blockedReason}</p>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {formatRelativeTime(item.updatedAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          {/* Client response tracker */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-yellow-400" />
              Client Response
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Pending approvals</span>
                <span className={`font-medium ${Number(pendingApprovals) > 0 ? "text-yellow-400" : "text-foreground"}`}>
                  {Number(pendingApprovals)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Approved reqs</span>
                <span className="font-medium text-green-400">{Number(approvedReqs)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Active pings</span>
                <span className="font-medium">{activePings.length}</span>
              </div>
            </div>
          </div>

          {/* Weekly progress */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h2 className="text-sm font-semibold text-foreground mb-3">Weekly Progress</h2>
            <div className="space-y-3">
              {weekData.map((w) => (
                <div key={w.week}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-muted-foreground">{w.week}</span>
                    <span className="text-muted-foreground">{w.done}/{w.total} · {w.pct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${w.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = "text-muted-foreground",
  valueColor,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  iconColor?: string;
  valueColor?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{label}</span>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </div>
      <p className={`text-2xl font-bold ${valueColor ?? "text-foreground"}`}>{value}</p>
    </div>
  );
}
