import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createScopeChange } from "@/lib/actions/scope-changes";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function NewScopeChangePage({ params }: Props) {
  const { org, project } = await params;
  const [projectData] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, project)).limit(1);
  if (!projectData) notFound();
  const action = createScopeChange.bind(null, projectData.id, org, project);

  return (
    <div className="p-6 max-w-2xl space-y-6">
      <Link
        href={`/${org}/${project}/scope-changes`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Scope Changes
      </Link>

      <div>
        <h1 className="text-xl font-bold text-foreground">Log Scope Change</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record any new request from the client that was not in the original scope.
        </p>
      </div>

      <form action={action} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Title</label>
          <input
            name="title"
            required
            placeholder="Brief description of the change"
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</label>
          <textarea
            name="description"
            rows={3}
            required
            placeholder="What did the client ask for?"
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Source</label>
            <select
              name="source"
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            >
              <option value="client_request">Client Request</option>
              <option value="meeting">Meeting</option>
              <option value="internal">Internal</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Est. Days Impact
            </label>
            <input
              name="estimatedDays"
              type="number"
              min="0"
              placeholder="0"
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Source Detail</label>
          <input
            name="sourceDetail"
            placeholder="e.g. WhatsApp message from CEO, 2025-04-08"
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Impact Description
          </label>
          <textarea
            name="impactDescription"
            rows={3}
            required
            placeholder="What does this mean for timeline, budget, or effort?"
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
          >
            Log Scope Change
          </button>
          <Link
            href={`/${org}/${project}/scope-changes`}
            className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/70 text-muted-foreground text-sm font-medium transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
