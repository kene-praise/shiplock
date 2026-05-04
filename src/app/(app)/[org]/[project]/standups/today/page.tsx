import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createStandup } from "@/lib/actions/standups";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function TodayStandupPage({ params }: Props) {
  const { org, project } = await params;
  const [projectData] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, project)).limit(1);
  if (!projectData) notFound();
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const action = createStandup.bind(null, projectData.id, "user_kene", org, project);

  return (
    <div className="p-6 max-w-xl space-y-6">
      <Link
        href={`/${org}/${project}/standups`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Standups
      </Link>

      <div>
        <h1 className="text-xl font-bold text-foreground">Today&apos;s Standup</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{today}</p>
      </div>

      <form action={action} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            What did you do yesterday?
          </label>
          <textarea
            name="didYesterday"
            rows={3}
            required
            placeholder="Tasks completed, PRs merged, meetings attended..."
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            What are you doing today?
          </label>
          <textarea
            name="doingToday"
            rows={3}
            required
            placeholder="Tasks planned, features to ship..."
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Any blockers?{" "}
            <span className="normal-case text-muted-foreground/60">(optional)</span>
          </label>
          <textarea
            name="blockers"
            rows={2}
            placeholder="Anything blocking your progress today?"
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
          >
            Submit Standup
          </button>
          <Link
            href={`/${org}/${project}/standups`}
            className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/70 text-muted-foreground text-sm font-medium transition-colors"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
