import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createTask } from "@/lib/actions/tasks";
import { SubmitButton } from "@/components/submit-button";
import { db } from "@/db";
import { requirements, projects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function NewTaskPage({ params }: Props) {
  const { org, project } = await params;

  const [projectData] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, project)).limit(1);
  if (!projectData) notFound();

  const reqs = await db
    .select({ id: requirements.id, refCode: requirements.refCode, title: requirements.title })
    .from(requirements)
    .where(eq(requirements.projectId, projectData.id));

  const action = createTask.bind(null, projectData.id, org, project);

  return (
    <div className="p-6 max-w-xl space-y-6">
      <Link href={`/${org}/${project}/tasks`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Tasks
      </Link>

      <div>
        <h1 className="text-xl font-bold text-foreground">New Task</h1>
        <p className="text-sm text-muted-foreground mt-0.5">A ref code will be assigned automatically.</p>
      </div>

      <form action={action} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Title</label>
          <input name="title" required placeholder="What needs to be done?" className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description <span className="normal-case text-muted-foreground/60">(optional)</span></label>
          <textarea name="description" rows={3} placeholder="Additional context..." className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Priority</label>
            <select name="priority" className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition">
              <option value="p0_critical">P0 — Critical</option>
              <option value="p1_high">P1 — High</option>
              <option value="p2_medium" selected>P2 — Medium</option>
              <option value="p3_low">P3 — Low</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Week</label>
            <select name="week" className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition">
              <option value="">— None —</option>
              <option value="W1">W1</option>
              <option value="W2">W2</option>
              <option value="W3">W3</option>
              <option value="W4">W4</option>
              <option value="W5">W5</option>
              <option value="W6">W6</option>
            </select>
          </div>
        </div>

        {reqs.length > 0 && (
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Linked Requirement <span className="normal-case text-muted-foreground/60">(optional)</span></label>
            <select name="requirementId" className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition">
              <option value="">— None —</option>
              {reqs.map((r) => (
                <option key={r.id} value={r.id}>{r.refCode} — {r.title}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <SubmitButton pendingText="Creating…" className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-60 text-primary-foreground text-sm font-medium transition-colors">
            Create Task
          </SubmitButton>
          <Link href={`/${org}/${project}/tasks`} className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/70 text-muted-foreground text-sm font-medium transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
