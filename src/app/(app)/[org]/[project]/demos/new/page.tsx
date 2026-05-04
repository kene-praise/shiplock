import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createDemo } from "@/lib/actions/demos";
import { db } from "@/db";
import { projects, requirements } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function NewDemoPage({ params }: Props) {
  const { org, project } = await params;
  const [projectData] = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, project)).limit(1);
  if (!projectData) notFound();

  const reqs = await db
    .select({ id: requirements.id, refCode: requirements.refCode, title: requirements.title, classification: requirements.classification })
    .from(requirements)
    .where(eq(requirements.projectId, projectData.id))
    .orderBy(asc(requirements.refCode));

  const todayISO = new Date().toISOString().split("T")[0];
  const action = createDemo.bind(null, projectData.id, org, project);

  return (
    <div className="p-6 max-w-xl space-y-6">
      <Link href={`/${org}/${project}/demos`} className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Demo Videos
      </Link>

      <div>
        <h1 className="text-xl font-bold text-foreground">Add Demo Video</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Paste a video URL and link it to the feature it demonstrates.</p>
      </div>

      <form action={action} className="space-y-5">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Title</label>
          <input name="title" required placeholder="e.g. Risk register — evidence upload flow" className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Feature / Requirement</label>
          <select
            name="requirementId"
            className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition"
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
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Video URL</label>
          <input name="videoUrl" type="url" required placeholder="https://loom.com/share/..." className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
          <p className="text-xs text-muted-foreground">Loom, YouTube, Google Drive, or any direct video link.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recorded On</label>
            <input name="recordedAt" type="date" defaultValue={todayISO} className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Duration (seconds) <span className="normal-case text-muted-foreground/60">(optional)</span></label>
            <input name="durationSeconds" type="number" min="0" placeholder="e.g. 180" className="w-full px-3 py-2 rounded-lg border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition" />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" className="flex-1 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-colors">
            Add Demo
          </button>
          <Link href={`/${org}/${project}/demos`} className="px-4 py-2 rounded-lg bg-muted hover:bg-muted/70 text-muted-foreground text-sm font-medium transition-colors">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
