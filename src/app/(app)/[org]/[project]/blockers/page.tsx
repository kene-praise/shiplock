import { db } from "@/db";
import { tasks, projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function BlockersPage({ params }: Props) {
  const { org, project } = await params;

  const [projectData] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, project)).limit(1);
  if (!projectData) notFound();

  const blocked = await db
    .select()
    .from(tasks)
    .where(and(eq(tasks.projectId, projectData.id), eq(tasks.status, "blocked")))
    .orderBy(tasks.updatedAt);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <AlertTriangle className={`h-5 w-5 ${blocked.length > 0 ? "text-red-400" : "text-muted-foreground"}`} />
          Blockers
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {blocked.length === 0 ? "Nothing blocked right now." : `${blocked.length} active blocker${blocked.length > 1 ? "s" : ""}`}
        </p>
      </div>

      {blocked.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center mb-4">
            <AlertTriangle className="h-5 w-5 text-green-400" />
          </div>
          <p className="text-sm font-medium text-foreground">All clear</p>
          <p className="text-xs text-muted-foreground mt-1">No tasks are blocked. Keep shipping.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blocked.map((task) => (
            <Link
              key={task.id}
              href={`/${org}/${project}/tasks/${task.id}`}
              className="flex gap-4 p-4 rounded-xl border border-red-900/40 bg-red-950/20 hover:border-red-800/60 transition-all group"
            >
              <div className="w-1 rounded-full bg-red-500 shrink-0 self-stretch" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="ref-code">{task.refCode}</span>
                  <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                    {task.title}
                  </span>
                </div>
                {task.blockedBy && (
                  <p className="text-xs text-red-400">
                    Blocked by: <span className="font-medium">{task.blockedBy}</span>
                  </p>
                )}
                {task.blockedReason && (
                  <p className="text-xs text-muted-foreground mt-0.5">{task.blockedReason}</p>
                )}
              </div>
              <span className="text-xs text-muted-foreground shrink-0 self-start mt-0.5">
                {formatRelativeTime(task.updatedAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
