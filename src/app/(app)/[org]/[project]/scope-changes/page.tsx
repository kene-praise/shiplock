import { db } from "@/db";
import { scopeChanges, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { GitBranch, Plus } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

const statusConfig = {
  pending:  { label: "Pending",  color: "text-yellow-400 bg-yellow-500/10" },
  accepted: { label: "Accepted", color: "text-green-400 bg-green-500/10" },
  rejected: { label: "Rejected", color: "text-red-400 bg-red-500/10" },
  deferred: { label: "Deferred", color: "text-zinc-400 bg-zinc-500/10" },
};

export default async function ScopeChangesPage({ params }: Props) {
  const { org, project } = await params;

  const [projectData] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, project)).limit(1);
  if (!projectData) notFound();

  const changes = await db
    .select()
    .from(scopeChanges)
    .where(eq(scopeChanges.projectId, projectData.id))
    .orderBy(scopeChanges.createdAt);

  const pending = changes.filter((c) => c.status === "pending").length;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Scope Changes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {changes.length} total · {pending} pending decision
          </p>
        </div>
        <Link
          href={`/${org}/${project}/scope-changes/new`}
          className="flex items-center gap-1.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground px-3 py-1.5 rounded-md transition-colors"
        >
          <Plus className="h-3.5 w-3.5" />
          Log Change
        </Link>
      </div>

      {changes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <GitBranch className="h-8 w-8 text-muted-foreground mb-3" />
          <p className="text-sm font-medium text-foreground">No scope changes yet</p>
          <p className="text-xs text-muted-foreground mt-1">Log changes when clients ask for new work.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {changes.map((change) => {
            const sCfg = statusConfig[change.status as keyof typeof statusConfig];
            return (
              <Link
                key={change.id}
                href={`/${org}/${project}/scope-changes/${change.id}`}
                className="block p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-all group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      {sCfg && (
                        <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", sCfg.color)}>
                          {sCfg.label}
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground capitalize">
                        {change.source.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                      {change.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {change.impactDescription}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    {change.estimatedDays != null && (
                      <p className="text-sm font-semibold text-foreground">+{change.estimatedDays}d</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(change.createdAt)}</p>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
