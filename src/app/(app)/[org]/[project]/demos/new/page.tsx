import Link from "next/link";
import { ArrowLeft } from "@/components/icons";
import { createDemo } from "@/lib/actions/demos";
import { SubmitButton } from "@/components/submit-button";
import { db } from "@/db";
import { requirements } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { getProjectForOrg } from "@/lib/project";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function NewDemoPage({ params }: Props) {
  const { org, project } = await params;
  const projectData = await getProjectForOrg(org, project);
  if (!projectData) notFound();

  const reqs = await db
    .select({ id: requirements.id, refCode: requirements.refCode, title: requirements.title, classification: requirements.classification })
    .from(requirements)
    .where(eq(requirements.projectId, projectData.id))
    .orderBy(asc(requirements.refCode));

  const todayISO = new Date().toISOString().split("T")[0];
  const action = createDemo.bind(null, projectData.id, org, project);

  return (
    <div className="px-5 py-4 max-w-xl space-y-4">
      <Link href={`/${org}/${project}/demos`} className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Demo Videos
      </Link>

      <div>
        <h1 className="text-[15px] font-semibold tracking-tight text-[var(--fg)]">Add Demo Video</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Paste a video URL and link it to the feature it demonstrates.</p>
      </div>

      <form action={action} className="space-y-5">
        <div className="space-y-1.5">
          <label className="field-label">Title</label>
          <input name="title" required placeholder="e.g. Risk register — evidence upload flow" className="field-input" />
        </div>

        <div className="space-y-1.5">
          <label className="field-label">Feature / Requirement</label>
          <select
            name="requirementId"
            className="field-input"
          >
            <option value="">— Not linked to a specific requirement —</option>
            {reqs.map((r) => (
              <option key={r.id} value={r.id}>
                {r.refCode} · {r.title}
                {r.classification === "post_mvp" ? " (Post-MVP)" : ""}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">Linking a video to a requirement connects it to the Definition of Done checklist.</p>
        </div>

        <div className="space-y-1.5">
          <label className="field-label">Video URL</label>
          <input name="videoUrl" type="url" required placeholder="https://loom.com/share/..." className="field-input" />
          <p className="text-xs text-muted-foreground">Loom, YouTube, Google Drive, or any direct video link.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="field-label">Recorded On</label>
            <input name="recordedAt" type="date" defaultValue={todayISO} className="field-input" />
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Duration (seconds) <span className="normal-case text-muted-foreground/60">(optional)</span></label>
            <input name="durationSeconds" type="number" min="0" placeholder="e.g. 180" className="field-input" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <SubmitButton pendingText="Adding…" className="btn-cta flex-1">
            Add Demo
          </SubmitButton>
          <Link href={`/${org}/${project}/demos`} className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
