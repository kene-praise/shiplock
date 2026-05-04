import { db } from "@/db";
import { scopeChanges } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, GitBranch } from "lucide-react";
import { formatDate, formatRelativeTime } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { updateScopeChangeStatus } from "@/lib/actions/scope-changes";

interface Props {
  params: Promise<{ org: string; project: string; id: string }>;
}

const statusConfig = {
  pending:  { label: "Pending Decision", color: "text-yellow-400 bg-yellow-500/10" },
  accepted: { label: "Accepted",         color: "text-green-400 bg-green-500/10" },
  rejected: { label: "Rejected",         color: "text-red-400 bg-red-500/10" },
  deferred: { label: "Deferred",         color: "text-zinc-400 bg-zinc-500/10" },
};

export default async function ScopeChangeDetailPage({ params }: Props) {
  const { org, project, id } = await params;

  const [change] = await db.select().from(scopeChanges).where(eq(scopeChanges.id, id)).limit(1);
  if (!change) notFound();

  const sCfg = statusConfig[change.status as keyof typeof statusConfig];

  const accept = updateScopeChangeStatus.bind(null, id, "accepted", org, project);
  const reject = updateScopeChangeStatus.bind(null, id, "rejected", org, project);
  const defer  = updateScopeChangeStatus.bind(null, id, "deferred", org, project);

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <Link
        href={`/${org}/${project}/scope-changes`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Scope Changes
      </Link>

      <div className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          {sCfg && (
            <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", sCfg.color)}>
              {sCfg.label}
            </span>
          )}
          <span className="text-xs text-muted-foreground capitalize">
            {change.source.replace("_", " ")}
          </span>
        </div>
        <h1 className="text-xl font-bold text-foreground">{change.title}</h1>
        <p className="text-sm text-muted-foreground leading-relaxed">{change.description}</p>
      </div>

      <div className="rounded-xl border border-orange-900/40 bg-orange-950/20 p-4 space-y-2">
        <p className="text-xs text-orange-400 uppercase tracking-wide font-medium">Impact</p>
        <p className="text-sm text-foreground leading-relaxed">{change.impactDescription}</p>
        {change.estimatedDays != null && (
          <p className="text-sm font-semibold text-orange-400">+{change.estimatedDays} estimated days</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-xl border border-border bg-card p-4 space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Logged</p>
          <p className="text-sm text-foreground">{formatDate(change.createdAt)}</p>
          <p className="text-xs text-muted-foreground">{formatRelativeTime(change.createdAt)}</p>
        </div>
        {change.sourceDetail && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Source</p>
            <p className="text-sm text-foreground">{change.sourceDetail}</p>
          </div>
        )}
        {change.acknowledgedAt && (
          <div className="rounded-xl border border-border bg-card p-4 space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Decision Date</p>
            <p className="text-sm text-foreground">{formatDate(change.acknowledgedAt)}</p>
          </div>
        )}
      </div>

      {change.status === "pending" && (
        <div className="flex gap-3">
          <form action={accept} className="flex-1">
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm font-medium transition-colors"
            >
              Accept
            </button>
          </form>
          <form action={reject} className="flex-1">
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-red-900/40 hover:bg-red-900/60 text-red-400 text-sm font-medium transition-colors border border-red-900/40"
            >
              Reject
            </button>
          </form>
          <form action={defer} className="flex-1">
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-muted hover:bg-muted/70 text-muted-foreground text-sm font-medium transition-colors"
            >
              Defer
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
