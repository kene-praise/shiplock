import { db } from "@/db";
import { standups, projects } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { BookOpen, Plus, AlertTriangle } from "lucide-react";
import { formatDate } from "@/lib/utils";

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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Standups</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{history.length} entries</p>
        </div>
        <Link
          href={`/${org}/${project}/standups/today`}
          className="flex items-center gap-1.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-md transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Today&apos;s Standup
        </Link>
      </div>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <BookOpen className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">No standups yet</p>
          <p className="text-xs text-muted-foreground mt-1">Log your first standup to start tracking progress.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {history.map((s) => (
            <div key={s.id} className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-foreground">{formatDate(s.date)}</p>
                {s.blockers && (
                  <span className="flex items-center gap-1 text-xs text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="h-3 w-3" />
                    Has blockers
                  </span>
                )}
              </div>
              <div className="space-y-2">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-0.5">Yesterday</p>
                  <p className="text-sm text-foreground">{s.didYesterday}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium mb-0.5">Today</p>
                  <p className="text-sm text-foreground">{s.doingToday}</p>
                </div>
                {s.blockers && (
                  <div>
                    <p className="text-[10px] text-yellow-500 uppercase tracking-widest font-medium mb-0.5">Blockers</p>
                    <p className="text-sm text-yellow-400">{s.blockers}</p>
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
