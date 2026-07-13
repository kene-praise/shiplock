import { db } from "@/db";
import { dodItems, requirements, tasks, demoVideos, projects, auditLogs, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Circle, Video, CheckSquare, ClipboardCheck } from "@/components/icons";
import { markDodMet, markDodUnmet, linkVideotoDod, updateDodItem } from "@/lib/actions/dod";
import { cn } from "@/lib/utils";
import { PageHeader, SecondaryLink } from "@/components/dashboard-ui";
import { StatusBadge, type StatusTone } from "@/components/ui/status-badge";
import { EditDodDialog } from "@/components/dialogs/EditDodDialog";

interface Props {
  params: Promise<{ org: string; project: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const taskStatusTone: Record<string, StatusTone> = {
  not_started: "neutral",
  in_progress: "auto",
  blocked:     "blocked",
  done:        "approved",
  cut:         "neutral",
};

const taskStatusLabel: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  blocked:     "Blocked",
  done:        "Done",
  cut:         "Cut",
};

const demoStatusTone: Record<string, StatusTone> = {
  pending:     "pending",
  approved:    "approved",
  rejected:    "blocked",
  no_response: "neutral",
};

const demoStatusLabel: Record<string, string> = {
  pending:     "Pending",
  approved:    "Approved",
  rejected:    "Rejected",
  no_response: "No Response",
};

export default async function DodPage({ params, searchParams }: Props) {
  const { org, project } = await params;
  const sParams = await searchParams;
  const selectedDodId = typeof sParams.edit_dod === "string" ? sParams.edit_dod : undefined;

  const [projectData] = await db.select({ id: projects.id, name: projects.name }).from(projects).where(eq(projects.slug, project)).limit(1);
  if (!projectData) notFound();

  // Load all DoD items with their linked requirement, task, and demo
  const items = await db
    .select({
      dod: dodItems,
      req: { id: requirements.id, refCode: requirements.refCode, title: requirements.title, classification: requirements.classification },
      task: { id: tasks.id, refCode: tasks.refCode, title: tasks.title, status: tasks.status },
      demo: { id: demoVideos.id, title: demoVideos.title, videoUrl: demoVideos.videoUrl, clientStatus: demoVideos.clientStatus },
    })
    .from(dodItems)
    .innerJoin(requirements, eq(dodItems.requirementId, requirements.id))
    .leftJoin(tasks, eq(dodItems.taskId, tasks.id))
    .leftJoin(demoVideos, eq(dodItems.demoVideoId, demoVideos.id))
    .where(eq(dodItems.projectId, projectData.id))
    .orderBy(requirements.refCode, dodItems.dodRef);

  // Load all project demo videos for the "attach proof" selector
  const allDemos = await db
    .select({ id: demoVideos.id, title: demoVideos.title, requirementId: demoVideos.requirementId })
    .from(demoVideos)
    .where(eq(demoVideos.projectId, projectData.id))
    .orderBy(desc(demoVideos.recordedAt));

  const taskList = await db
    .select({ id: tasks.id, refCode: tasks.refCode, title: tasks.title })
    .from(tasks)
    .where(eq(tasks.projectId, projectData.id))
    .orderBy(tasks.refCode);

  let selectedDodData = null;
  if (selectedDodId) {
    const [dod] = await db.select().from(dodItems).where(eq(dodItems.id, selectedDodId)).limit(1);
    if (dod) {
      const dodHistory = await db
        .select({
          id: auditLogs.id,
          action: auditLogs.action,
          oldValue: auditLogs.oldValue,
          newValue: auditLogs.newValue,
          createdAt: auditLogs.createdAt,
          user: { name: users.name },
        })
        .from(auditLogs)
        .leftJoin(users, eq(auditLogs.userId, users.id))
        .where(and(eq(auditLogs.entityId, selectedDodId), eq(auditLogs.entityType, "dod")))
        .orderBy(desc(auditLogs.createdAt));
      selectedDodData = { dod, dodHistory };
    }
  }

  // Group by requirement
  const grouped = new Map<string, { req: typeof items[0]["req"]; items: typeof items }>();
  for (const item of items) {
    const key = item.req.id;
    if (!grouped.has(key)) grouped.set(key, { req: item.req, items: [] });
    grouped.get(key)!.items.push(item);
  }

  const totalItems = items.length;
  const metItems = items.filter((i) => i.dod.met).length;
  const pct = totalItems > 0 ? Math.round((metItems / totalItems) * 100) : 0;

  return (
    <div className="min-h-full w-full max-w-[1100px] mx-auto px-8 py-6 flex flex-col gap-4">
      <PageHeader
        title="Definition of Done"
        meta="Acceptance criteria per feature — with implementing task and proof video"
      >
        <SecondaryLink href={`/${org}/${project}/demos`}>Manage videos</SecondaryLink>
      </PageHeader>

      {/* Progress bar */}
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] p-4 space-y-2.5 animate-enter" style={{ "--stagger": 1 } as React.CSSProperties}>
        <div className="flex items-center justify-between text-[12.5px]">
          <span className="text-[var(--fg-secondary)]">Overall completion</span>
          <span
            className="font-semibold tabular-nums"
            style={{ color: pct === 100 ? "var(--success)" : "var(--fg)" }}
          >
            {metItems} / {totalItems} criteria met · {pct}%
          </span>
        </div>
        <div className="h-2 rounded-[var(--radius-full)] bg-[var(--bg-muted)] overflow-hidden">
          <div
            className="h-full rounded-[var(--radius-full)] transition-all"
            style={{ width: `${pct}%`, background: pct === 100 ? "var(--success)" : "var(--accent)" }}
          />
        </div>
      </div>

      {/* Grouped by requirement */}
      {grouped.size === 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] flex flex-col items-center justify-center py-24 text-center animate-enter" style={{ "--stagger": 2 } as React.CSSProperties}>
          <ClipboardCheck className="h-8 w-8 text-[var(--fg-disabled)] mb-3" />
          <p className="text-[13px] font-medium text-[var(--fg)]">No DoD criteria yet</p>
          <p className="text-[11px] text-[var(--fg-muted)] mt-1">Criteria are derived from tasks with DoD references.</p>
        </div>
      ) : (
        <div className="space-y-6 animate-enter" style={{ "--stagger": 2 } as React.CSSProperties}>
          {Array.from(grouped.values()).map(({ req, items: reqItems }) => {
            const met = reqItems.filter((i) => i.dod.met).length;
            const allMet = met === reqItems.length;

            return (
              <section key={req.id} className="space-y-2">
                {/* Requirement header */}
                <div className="flex items-center gap-3">
                  <span className="ref-code">{req.refCode}</span>
                  <span className="text-[13px] font-semibold text-[var(--fg)] flex-1 truncate">{req.title}</span>
                  <span
                    className="text-[12px] font-mono font-medium tabular-nums"
                    style={{ color: allMet ? "var(--success)" : "var(--fg-muted)" }}
                  >
                    {met}/{reqItems.length}
                  </span>
                </div>

                {/* DoD items for this requirement */}
                <div className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] divide-y divide-[var(--border)] overflow-hidden">
                  {reqItems.map(({ dod, task, demo }) => {
                    const metAction = markDodMet.bind(null, dod.id, org, project);
                    const unmetAction = markDodUnmet.bind(null, dod.id, org, project);
                    const demosForReq = allDemos.filter((d) => d.requirementId === req.id || !d.requirementId);

                    return (
                      <div
                        key={dod.id}
                        className="p-4 space-y-3"
                        style={dod.met ? { background: "var(--success-muted)" } : undefined}
                      >
                        {/* Criterion row */}
                        <div className="flex items-start gap-3">
                          <form action={dod.met ? unmetAction : metAction} className="shrink-0 mt-0.5">
                            <button type="submit" className="focus:outline-none">
                              {dod.met
                                ? <CheckCircle2 className="h-4.5 w-4.5 text-[var(--success)]" />
                                : <Circle className="h-4.5 w-4.5 text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors" />
                              }
                            </button>
                          </form>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-[10px] font-mono font-medium text-[var(--fg-muted)]">{dod.dodRef}</span>
                              <Link href={`/${org}/${project}/dod?edit_dod=${dod.id}`} className="text-[11.5px] text-[var(--accent)] hover:underline">
                                Edit
                              </Link>
                            </div>
                            <p className={cn("text-[13px]", dod.met ? "text-[var(--fg-muted)] line-through" : "text-[var(--fg)]")}>
                              {dod.criterion}
                            </p>
                          </div>
                        </div>

                        {/* Task + Demo links */}
                        <div className="flex items-center gap-3 ml-7 flex-wrap">
                          {task ? (
                            <Link
                              href={`/${org}/${project}/tasks?task=${task.id}`}
                              className="flex items-center gap-1.5 text-[12px] transition-colors group"
                            >
                              <CheckSquare className="h-3.5 w-3.5 text-[var(--fg-muted)] group-hover:text-[var(--fg)]" />
                              <span className="font-mono text-[var(--fg-muted)]">{task.refCode}</span>
                              <span className="text-[var(--fg-secondary)] group-hover:text-[var(--fg)] truncate max-w-[200px]">{task.title}</span>
                              <StatusBadge tone={taskStatusTone[task.status] ?? "neutral"} dot={false}>
                                {taskStatusLabel[task.status]}
                              </StatusBadge>
                            </Link>
                          ) : (
                            <span className="text-[12px] text-[var(--fg-disabled)]">No task linked</span>
                          )}

                          {demo ? (
                            <a
                              href={demo.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[12px] transition-colors group"
                            >
                              <Video className="h-3.5 w-3.5 text-[var(--fg-muted)] group-hover:text-[var(--fg)]" />
                              <span className="text-[var(--fg-secondary)] group-hover:text-[var(--fg)] truncate max-w-[180px]">{demo.title}</span>
                              <StatusBadge tone={demoStatusTone[demo.clientStatus] ?? "neutral"} dot={false}>
                                {demoStatusLabel[demo.clientStatus]}
                              </StatusBadge>
                            </a>
                          ) : (
                            <form action={async (fd: FormData) => {
                              "use server";
                              const vid = fd.get("demoVideoId") as string;
                              if (vid) await linkVideotoDod(dod.id, vid, org, project);
                            }}>
                              <div className="flex items-center gap-1.5">
                                <Video className="h-3.5 w-3.5 text-[var(--fg-disabled)]" />
                                <select
                                  name="demoVideoId"
                                  className="text-[12px] bg-transparent border border-[var(--border)] rounded-[var(--radius-sm)] px-1.5 py-0.5 text-[var(--fg-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                                >
                                  <option value="">Attach proof video…</option>
                                  {demosForReq.map((d) => (
                                    <option key={d.id} value={d.id}>{d.title}</option>
                                  ))}
                                </select>
                                {demosForReq.length > 0 && (
                                  <button type="submit" className="text-[12px] text-[var(--accent)] hover:underline">Link</button>
                                )}
                              </div>
                            </form>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {selectedDodData && (
        <EditDodDialog
          dod={selectedDodData.dod}
          tasks={taskList}
          demos={allDemos}
          onCloseUrl={`/${org}/${project}/dod`}
          updateAction={updateDodItem.bind(null, selectedDodData.dod.id, org, project)}
          history={selectedDodData.dodHistory as { id: string; action: string; oldValue: Record<string, unknown> | null; newValue: Record<string, unknown> | null; createdAt: Date; user: { name: string } | null }[]}
        />
      )}
    </div>
  );
}
