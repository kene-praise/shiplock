import { db } from "@/db";
import { dodItems, requirements, tasks, demoVideos, projects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Circle, Video, CheckSquare, ClipboardCheck } from "lucide-react";
import { markDodMet, markDodUnmet, linkVideotoDod } from "@/lib/actions/dod";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

const taskStatusColor: Record<string, string> = {
  not_started: "text-zinc-400 bg-zinc-500/10",
  in_progress: "text-blue-400 bg-blue-500/10",
  blocked:     "text-red-400 bg-red-500/10",
  done:        "text-green-400 bg-green-500/10",
  cut:         "text-zinc-500 bg-zinc-500/10",
};

const taskStatusLabel: Record<string, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  blocked:     "Blocked",
  done:        "Done",
  cut:         "Cut",
};

const demoStatusColor: Record<string, string> = {
  pending:     "text-yellow-400 bg-yellow-500/10",
  approved:    "text-green-400 bg-green-500/10",
  rejected:    "text-red-400 bg-red-500/10",
  no_response: "text-zinc-400 bg-zinc-500/10",
};

const demoStatusLabel: Record<string, string> = {
  pending:     "Pending",
  approved:    "Approved",
  rejected:    "Rejected",
  no_response: "No Response",
};

export default async function DodPage({ params }: Props) {
  const { org, project } = await params;

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-muted-foreground" />
            Definition of Done
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Acceptance criteria per feature — with implementing task and proof video
          </p>
        </div>
        <Link
          href={`/${org}/${project}/demos`}
          className="text-sm text-muted-foreground hover:text-foreground border border-border px-3 py-1.5 rounded-md transition-colors"
        >
          Manage videos
        </Link>
      </div>

      {/* Progress bar */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Overall completion</span>
          <span className={cn("font-semibold", pct === 100 ? "text-green-400" : "text-foreground")}>
            {metItems} / {totalItems} criteria met · {pct}%
          </span>
        </div>
        <div className="h-2 rounded-full bg-muted overflow-hidden">
          <div
            className={cn("h-full rounded-full transition-all", pct === 100 ? "bg-green-500" : "bg-primary")}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Grouped by requirement */}
      {grouped.size === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <ClipboardCheck className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">No DoD criteria yet</p>
          <p className="text-xs text-muted-foreground mt-1">Criteria are derived from tasks with DoD references.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(grouped.values()).map(({ req, items: reqItems }) => {
            const met = reqItems.filter((i) => i.dod.met).length;
            const allMet = met === reqItems.length;

            return (
              <section key={req.id} className="space-y-2">
                {/* Requirement header */}
                <div className="flex items-center gap-3">
                  <span className={cn(
                    "text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide font-mono",
                    req.classification === "post_mvp" ? "text-zinc-400 bg-zinc-500/10" : "text-indigo-400 bg-indigo-500/10"
                  )}>
                    {req.refCode}
                  </span>
                  <span className="text-sm font-semibold text-foreground flex-1 truncate">{req.title}</span>
                  <span className={cn(
                    "text-xs font-medium",
                    allMet ? "text-green-400" : "text-muted-foreground"
                  )}>
                    {met}/{reqItems.length}
                  </span>
                </div>

                {/* DoD items for this requirement */}
                <div className="rounded-xl border border-border divide-y divide-border overflow-hidden">
                  {reqItems.map(({ dod, task, demo }) => {
                    const metAction = markDodMet.bind(null, dod.id, org, project);
                    const unmetAction = markDodUnmet.bind(null, dod.id, org, project);
                    const demosForReq = allDemos.filter((d) => d.requirementId === req.id || !d.requirementId);

                    return (
                      <div key={dod.id} className={cn("p-4 space-y-3", dod.met && "bg-green-950/10")}>
                        {/* Criterion row */}
                        <div className="flex items-start gap-3">
                          <form action={dod.met ? unmetAction : metAction} className="shrink-0 mt-0.5">
                            <button type="submit" className="focus:outline-none">
                              {dod.met
                                ? <CheckCircle2 className="h-4.5 w-4.5 text-green-400" />
                                : <Circle className="h-4.5 w-4.5 text-muted-foreground hover:text-foreground transition-colors" />
                              }
                            </button>
                          </form>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="text-[10px] font-mono font-semibold text-muted-foreground">{dod.dodRef}</span>
                            </div>
                            <p className={cn("text-sm", dod.met ? "text-muted-foreground line-through" : "text-foreground")}>
                              {dod.criterion}
                            </p>
                          </div>
                        </div>

                        {/* Task + Demo links */}
                        <div className="flex items-center gap-3 ml-7 flex-wrap">
                          {task ? (
                            <Link
                              href={`/${org}/${project}/tasks/${task.id}`}
                              className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors group"
                            >
                              <CheckSquare className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                              <span className="font-mono text-muted-foreground">{task.refCode}</span>
                              <span className="text-muted-foreground truncate max-w-[200px]">{task.title}</span>
                              <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", taskStatusColor[task.status])}>
                                {taskStatusLabel[task.status]}
                              </span>
                            </Link>
                          ) : (
                            <span className="text-xs text-muted-foreground/50">No task linked</span>
                          )}

                          {demo ? (
                            <a
                              href={demo.videoUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-xs hover:text-foreground transition-colors group"
                            >
                              <Video className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground" />
                              <span className="text-muted-foreground truncate max-w-[180px]">{demo.title}</span>
                              <span className={cn("text-[10px] px-1.5 py-0.5 rounded font-medium", demoStatusColor[demo.clientStatus])}>
                                {demoStatusLabel[demo.clientStatus]}
                              </span>
                            </a>
                          ) : (
                            <form action={async (fd: FormData) => {
                              "use server";
                              const vid = fd.get("demoVideoId") as string;
                              if (vid) await linkVideotoDod(dod.id, vid, org, project);
                            }}>
                              <div className="flex items-center gap-1.5">
                                <Video className="h-3.5 w-3.5 text-muted-foreground/40" />
                                <select
                                  name="demoVideoId"
                                  className="text-xs bg-transparent border border-border rounded px-1.5 py-0.5 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
                                >
                                  <option value="">Attach proof video…</option>
                                  {demosForReq.map((d) => (
                                    <option key={d.id} value={d.id}>{d.title}</option>
                                  ))}
                                </select>
                                {demosForReq.length > 0 && (
                                  <button type="submit" className="text-xs text-primary hover:underline">Link</button>
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
    </div>
  );
}
