import { db } from "@/db";
import { auditLogs, projects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Shield } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

const entityColors: Record<string, string> = {
  requirement: "text-indigo-400 bg-indigo-500/10",
  task:        "text-blue-400 bg-blue-500/10",
  demo:        "text-purple-400 bg-purple-500/10",
  scope_change:"text-orange-400 bg-orange-500/10",
  standup:     "text-green-400 bg-green-500/10",
};

export default async function AuditLogPage({ params }: Props) {
  const { project } = await params;

  const [projectData] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, project)).limit(1);
  if (!projectData) notFound();

  const logs = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.projectId, projectData.id))
    .orderBy(desc(auditLogs.createdAt))
    .limit(100);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          Audit Log
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Full tamper-evident history of all changes
        </p>
      </div>

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Shield className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">No events yet</p>
          <p className="text-xs text-muted-foreground mt-1">Actions will be logged here as you work.</p>
        </div>
      ) : (
        <div className="space-y-0.5">
          {logs.map((log, i) => {
            const color = entityColors[log.entityType] ?? "text-zinc-400 bg-zinc-500/10";
            return (
              <div
                key={log.id}
                className="flex items-start gap-3 py-3 border-b border-border last:border-0"
              >
                <div className="flex flex-col items-center shrink-0 mt-0.5">
                  <div className="w-2 h-2 rounded-full bg-primary/60" />
                  {i < logs.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${color}`}>
                      {log.entityType}
                    </span>
                    <span className="text-sm text-foreground">{log.action}</span>
                  </div>
                  {log.metadata != null && (
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                      {JSON.stringify(log.metadata as Record<string, unknown>)}
                    </p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{formatRelativeTime(log.createdAt)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
