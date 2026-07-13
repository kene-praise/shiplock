import { db } from "@/db";
import { standups, projects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import { BookOpen, Plus, AlertTriangle } from "@/components/icons";
import { formatDate } from "@/lib/utils";
import { PageHeader, CtaLink, SectionLabel } from "@/components/dashboard-ui";
import { StatusBadge } from "@/components/ui/status-badge";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function StandupsPage({ params }: Props) {
  const { org, project } = await params;

  const [projectData] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, project)).limit(1);
  if (!projectData) notFound();

  const history = await db
    .select()
    .from(standups)
    .where(eq(standups.projectId, projectData.id))
    .orderBy(desc(standups.date));

  return (
    <div className="min-h-full w-full max-w-[1100px] mx-auto px-8 py-6 flex flex-col gap-4">
      <PageHeader title="Standups" meta={`${history.length} entries`}>
        <CtaLink href={`/${org}/${project}/standups/today`}>
          <Plus className="h-3.5 w-3.5" /> Today&apos;s Standup
        </CtaLink>
      </PageHeader>

      {history.length === 0 ? (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] flex flex-col items-center justify-center py-24 text-center animate-enter" style={{ "--stagger": 1 } as React.CSSProperties}>
          <BookOpen className="h-8 w-8 text-[var(--fg-disabled)] mb-3" />
          <p className="text-[13px] font-medium text-[var(--fg)]">No standups yet</p>
          <p className="text-[11px] text-[var(--fg-muted)] mt-1">Log your first standup to start tracking progress.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 animate-enter" style={{ "--stagger": 1 } as React.CSSProperties}>
          {history.map((s) => (
            <div key={s.id} className="rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
              <div
                className="flex items-center justify-between px-4 py-2.5"
                style={{ background: "var(--card-footer)", borderBottom: "1px solid var(--border-footer)" }}
              >
                <p className="text-[12px] font-mono font-medium text-[var(--fg-secondary)] tabular-nums">{formatDate(s.date)}</p>
                {s.blockers && (
                  <StatusBadge tone="blocked" dot={false}>
                    <AlertTriangle className="h-3 w-3" /> Has blockers
                  </StatusBadge>
                )}
              </div>
              <div className="p-4 flex flex-col gap-3">
                <div>
                  <SectionLabel>Yesterday</SectionLabel>
                  <p className="text-[13px] text-[var(--fg)] mt-1">{s.didYesterday}</p>
                </div>
                <div>
                  <SectionLabel>Today</SectionLabel>
                  <p className="text-[13px] text-[var(--fg)] mt-1">{s.doingToday}</p>
                </div>
                {s.blockers && (
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--danger)]">Blockers</p>
                    <p className="text-[13px] text-[var(--fg-secondary)] mt-1">{s.blockers}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
