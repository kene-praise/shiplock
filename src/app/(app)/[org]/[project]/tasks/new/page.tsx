import Link from "next/link";
import { ArrowLeft } from "@/components/icons";
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
    <div className="px-5 py-4 max-w-xl space-y-4">
      <Link href={`/${org}/${project}/tasks`} className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Tasks
      </Link>

      <div>
        <h1 className="text-[15px] font-semibold tracking-tight text-[var(--fg)]">New Task</h1>
        <p className="text-sm text-muted-foreground mt-0.5">A ref code will be assigned automatically.</p>
      </div>

      <form action={action} className="space-y-5">
        <div className="space-y-1.5">
          <label className="field-label">Title</label>
          <input name="title" required placeholder="What needs to be done?" className="field-input" />
        </div>

        <div className="space-y-1.5">
          <label className="field-label">Description <span className="normal-case text-muted-foreground/60">(optional)</span></label>
          <textarea name="description" rows={3} placeholder="Additional context..." className="field-input resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="field-label">Priority</label>
            <select name="priority" className="field-input">
              <option value="p0_critical">P0 — Critical</option>
              <option value="p1_high">P1 — High</option>
              <option value="p2_medium" selected>P2 — Medium</option>
              <option value="p3_low">P3 — Low</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Week</label>
            <select name="week" className="field-input">
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
            <label className="field-label">Linked Requirement <span className="normal-case text-muted-foreground/60">(optional)</span></label>
            <select name="requirementId" className="field-input">
              <option value="">— None —</option>
              {reqs.map((r) => (
                <option key={r.id} value={r.id}>{r.refCode} — {r.title}</option>
              ))}
            </select>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <SubmitButton pendingText="Creating…" className="btn-cta flex-1">
            Create Task
          </SubmitButton>
          <Link href={`/${org}/${project}/tasks`} className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
