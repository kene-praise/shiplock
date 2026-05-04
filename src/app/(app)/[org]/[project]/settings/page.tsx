import { db } from "@/db";
import { projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { Settings } from "lucide-react";
import { updateProject, archiveProject } from "@/lib/actions/projects";

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
    <div className="p-6 max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          Project Settings
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{proj.name}</p>
      </div>

      {/* General */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">General</h2>
        <form action={save} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Project Name</label>
            <input
              name="name"
              required
              defaultValue={proj.name}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</label>
            <textarea
              name="description"
              defaultValue={proj.description ?? ""}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
              <select
                name="status"
                defaultValue={proj.status}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">MVP Deadline</label>
              <input
                name="mvpDeadline"
                type="date"
                defaultValue={proj.mvpDeadline ?? ""}
                className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </div>
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors"
          >
            Save Changes
          </button>
        </form>
      </section>

      {/* Auto-approve */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-foreground border-b border-border pb-2">
          Auto-Approve Settings
        </h2>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Auto-approve after (hours)
          </label>
          <input
            type="number"
            defaultValue={48}
            min={12}
            max={168}
            className="w-40 px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Requirements and demos sent for review auto-approve if the client doesn&apos;t respond within this window.
          </p>
        </div>
      </section>

      {/* Danger zone */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold text-red-400 border-b border-red-900/40 pb-2">Danger Zone</h2>
        <div className="rounded-xl border border-red-900/40 bg-red-950/20 p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">Archive this project</p>
            <p className="text-xs text-muted-foreground mt-0.5">Hides the project from the list. Data is preserved.</p>
          </div>
          <form action={archive}>
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg border border-red-800 text-red-400 text-sm hover:bg-red-900/30 transition-colors"
            >
              Archive
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
