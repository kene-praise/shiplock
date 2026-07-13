import { db } from "@/db";
import { tasks, projects } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CheckCircle2 } from "@/components/icons";
import { formatRelativeTime } from "@/lib/utils";
import { PageHeader } from "@/components/dashboard-ui";

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
    <div className="min-h-full w-full max-w-[1100px] mx-auto px-8 py-6 flex flex-col gap-4">
      <PageHeader
        title="Blockers"
        meta={blocked.length === 0 ? "Nothing blocked right now." : `${blocked.length} active blocker${blocked.length > 1 ? "s" : ""}`}
      />

      {blocked.length === 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] flex flex-col items-center justify-center py-24 text-center animate-enter" style={{ "--stagger": 1 } as React.CSSProperties}>
          <div
            className="w-11 h-11 rounded-[var(--radius-lg)] flex items-center justify-center mb-4 border border-[var(--border)]"
            style={{ background: "var(--success-muted)", outline: "1px solid var(--border)", outlineOffset: "2px" }}
          >
            <CheckCircle2 className="h-5 w-5 text-[var(--success)]" />
          </div>
          <p className="text-[13px] font-medium text-[var(--fg)]">All clear</p>
          <p className="text-[11px] text-[var(--fg-muted)] mt-1">No tasks are blocked. Keep shipping.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2 animate-enter" style={{ "--stagger": 1 } as React.CSSProperties}>
          {blocked.map((task) => (
            <Link
              key={task.id}
              href={`/${org}/${project}/tasks/${task.id}`}
              className="flex gap-4 p-4 rounded-[var(--radius-lg)] bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:shadow-[var(--shadow-sm)] transition-[border-color,box-shadow] duration-150 group"
            >
              <div className="w-1 rounded-full bg-[var(--danger)] shrink-0 self-stretch" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="ref-code">{task.refCode}</span>
                  <span className="text-[13px] font-medium text-[var(--fg)] group-hover:text-[var(--accent)] transition-colors truncate">
                    {task.title}
                  </span>
                </div>
                {task.blockedBy && (
                  <p className="text-[12px] text-[var(--danger)]">
                    Blocked by: <span className="font-medium">{task.blockedBy}</span>
                  </p>
                )}
                {task.blockedReason && (
                  <p className="text-[12px] text-[var(--fg-muted)] mt-0.5">{task.blockedReason}</p>
                )}
              </div>
              <span className="text-[11px] text-[var(--fg-muted)] shrink-0 self-start mt-0.5 tabular-nums">
                {formatRelativeTime(task.updatedAt)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
