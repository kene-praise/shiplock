import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { updateProject, archiveProject } from "@/lib/actions/projects";
import { PageHeader, SectionLabel } from "@/components/dashboard-ui";
import { SubmitButton } from "@/components/submit-button";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function ProjectSettingsPage({ params }: Props) {
  const { org, project } = await params;

  const [proj] = await db.select().from(projects).where(eq(projects.slug, project)).limit(1);
  if (!proj) notFound();

  const save    = updateProject.bind(null, proj.id, project, org);
  const archive = archiveProject.bind(null, proj.id, org);

  return (
    <div className="min-h-full w-full max-w-2xl mx-auto px-8 py-6 flex flex-col gap-4">
      <PageHeader title="Project Settings" meta={proj.name} />

      {/* General */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] overflow-hidden animate-enter" style={{ "--stagger": 1 } as React.CSSProperties}>
        <form action={save}>
          <div className="p-5 space-y-4">
            <SectionLabel>General</SectionLabel>
            <div className="space-y-1.5">
              <label className="field-label block">Project Name</label>
              <input name="name" required defaultValue={proj.name} className="field-input" />
            </div>
            <div className="space-y-1.5">
              <label className="field-label block">Description</label>
              <textarea
                name="description"
                defaultValue={proj.description ?? ""}
                rows={2}
                className="field-input resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="field-label block">Status</label>
                <select name="status" defaultValue={proj.status} className="field-input">
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="field-label block">MVP Deadline</label>
                <input name="mvpDeadline" type="date" defaultValue={proj.mvpDeadline ?? ""} className="field-input" />
              </div>
            </div>
          </div>
          <div
            className="px-5 py-3 flex justify-end"
            style={{ background: "var(--card-footer)", borderTop: "1px solid var(--border-footer)" }}
          >
            <SubmitButton pendingText="Saving…" className="btn-cta">
              Save Changes
            </SubmitButton>
          </div>
        </form>
      </section>

      {/* Auto-approve */}
      <section className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 space-y-4 animate-enter" style={{ "--stagger": 2 } as React.CSSProperties}>
        <SectionLabel>Auto-Approve Settings</SectionLabel>
        <div className="space-y-1.5">
          <label className="field-label block">Auto-approve after (hours)</label>
          <input type="number" defaultValue={48} min={12} max={168} className="field-input !w-40 tabular-nums" />
          <p className="text-[11.5px] text-[var(--fg-muted)] mt-1">
            Requirements and demos sent for review auto-approve if the client doesn&apos;t respond within this window.
          </p>
        </div>
      </section>

      {/* Danger zone */}
      <section className="space-y-2.5 animate-enter" style={{ "--stagger": 3 } as React.CSSProperties}>
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[var(--danger)]">Danger Zone</p>
        <div className="rounded-[var(--radius-lg)] border border-[var(--danger)]/25 bg-[var(--danger-muted)] p-4 flex items-center justify-between">
          <div>
            <p className="text-[13px] font-medium text-[var(--fg)]">Archive this project</p>
            <p className="text-[11.5px] text-[var(--fg-secondary)] mt-0.5">Hides the project from the list. Data is preserved.</p>
          </div>
          <form action={archive}>
            <button type="submit" className="btn-danger !h-8 !px-3.5 !text-[12.5px]">
              Archive
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
