import { db } from "@/db";
import { auditLogs, projects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Shield } from "@/components/icons";
import { formatRelativeTime } from "@/lib/utils";
import { PageHeader, T, type ToneKey } from "@/components/dashboard-ui";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

const entityTones: Record<string, ToneKey> = {
  requirement: "blue",
  task: "blue",
  demo: "gray",
  scope_change: "amber",
  standup: "green",
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
    <div className="min-h-full w-full max-w-[1100px] mx-auto px-8 py-6 flex flex-col gap-4">
      <PageHeader title="Audit Log" meta="Full tamper-evident history of all changes" />

      {logs.length === 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] flex flex-col items-center justify-center py-24 text-center animate-enter" style={{ "--stagger": 1 } as React.CSSProperties}>
          <Shield className="h-8 w-8 text-[var(--fg-disabled)] mb-3" />
          <p className="text-[13px] font-medium text-[var(--fg)]">No events yet</p>
          <p className="text-[11px] text-[var(--fg-muted)] mt-1">Actions will be logged here as you work.</p>
        </div>
      ) : (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] px-5 py-2 animate-enter" style={{ "--stagger": 1 } as React.CSSProperties}>
          {logs.map((log, i) => {
            const tone = T[entityTones[log.entityType] ?? "gray"];
            return (
              <div
                key={log.id}
                className="flex items-start gap-3 py-3 border-b border-[var(--border)] last:border-0"
              >
                <div className="flex flex-col items-center shrink-0 mt-0.5 self-stretch">
                  <div className="w-2 h-2 rounded-full" style={{ background: "var(--accent)", opacity: 0.6 }} />
                  {i < logs.length - 1 && <div className="w-px flex-1 bg-[var(--border)] mt-1" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded-[var(--radius-xs)] uppercase tracking-wide"
                      style={{ color: tone.fg, background: tone.bg }}
                    >
                      {log.entityType}
                    </span>
                    <span className="text-[13px] text-[var(--fg)]">{log.action}</span>
                  </div>
                  {log.metadata != null && (
                    <p className="text-[11px] text-[var(--fg-muted)] mt-0.5 font-mono truncate">
                      {JSON.stringify(log.metadata as Record<string, unknown>)}
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-[var(--fg-muted)] shrink-0 tabular-nums">{formatRelativeTime(log.createdAt)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
