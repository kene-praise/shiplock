import Link from "next/link";
import { ArrowLeft } from "@/components/icons";
import { createStandup } from "@/lib/actions/standups";
import { SubmitButton } from "@/components/submit-button";
import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard-ui";

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

  const action = createStandup.bind(null, projectData.id, org, project);

  return (
    <div className="min-h-full w-full max-w-xl mx-auto px-8 py-6 flex flex-col gap-4">
      <Link
        href={`/${org}/${project}/standups`}
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors self-start"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Standups
      </Link>

      <PageHeader title="Today's Standup" meta={today} />

      <form action={action} className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden animate-enter" style={{ "--stagger": 1 } as React.CSSProperties}>
        <div className="p-5 space-y-5">
          <div className="space-y-1.5">
            <label className="field-label block">What did you do yesterday?</label>
            <textarea
              name="didYesterday"
              rows={3}
              required
              placeholder="Tasks completed, PRs merged, meetings attended..."
              className="field-input resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="field-label block">What are you doing today?</label>
            <textarea
              name="doingToday"
              rows={3}
              required
              placeholder="Tasks planned, features to ship..."
              className="field-input resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="field-label block">
              Any blockers? <span className="text-[var(--fg-muted)]">(optional)</span>
            </label>
            <textarea
              name="blockers"
              rows={2}
              placeholder="Anything blocking your progress today?"
              className="field-input resize-none"
            />
          </div>
        </div>

        <div
          className="px-5 py-3 flex items-center justify-end gap-2"
          style={{ background: "var(--card-footer)", borderTop: "1px solid var(--border-footer)" }}
        >
          <Link href={`/${org}/${project}/standups`} className="btn-secondary !h-8 !px-3.5 !text-[12.5px]">
            Cancel
          </Link>
          <SubmitButton pendingText="Submitting…" className="btn-cta !h-8 !px-3.5 !text-[12.5px]">
            Submit Standup
          </SubmitButton>
        </div>
      </form>
    </div>
  );
}
