import Link from "next/link";
import { ArrowLeft } from "@/components/icons";
import { createRequirement } from "@/lib/actions/requirements";
import { SubmitButton } from "@/components/submit-button";
import { getProjectForOrg } from "@/lib/project";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function NewRequirementPage({ params }: Props) {
  const { org, project } = await params;
  const projectData = await getProjectForOrg(org, project);
  if (!projectData) notFound();
  const action = async (formData: FormData) => {
    "use server";
    await createRequirement(projectData.id, org, project, null, formData);
  };

  return (
    <div className="px-5 py-4 max-w-xl space-y-4">
      <Link href={`/${org}/${project}/requirements`} className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors">
        <ArrowLeft className="h-3.5 w-3.5" /> Requirements
      </Link>

      <div>
        <h1 className="text-[15px] font-semibold tracking-tight text-[var(--fg)]">Add Requirement</h1>
        <p className="text-sm text-muted-foreground mt-0.5">A ref code (REQ-xxx) will be assigned automatically.</p>
      </div>

      <form action={action} className="space-y-5">
        <div className="space-y-1.5">
          <label className="field-label">Title</label>
          <input name="title" required placeholder="Short, specific requirement title" className="field-input" />
        </div>

        <div className="space-y-1.5">
          <label className="field-label">Description</label>
          <textarea name="description" rows={4} required placeholder="Full description of what needs to be built..." className="field-input resize-none" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="field-label">Classification</label>
            <select name="classification" className="field-input">
              <option value="mvp">MVP</option>
              <option value="post_mvp">Post-MVP</option>
              <option value="out_of_scope">Out of Scope</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="field-label">Source</label>
            <select name="source" className="field-input">
              <option value="meeting">Meeting</option>
              <option value="document">Document</option>
              <option value="email">Email</option>
              <option value="verbal">Verbal</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="field-label">Source Detail <span className="normal-case text-muted-foreground/60">(optional)</span></label>
          <input name="sourceDetail" placeholder="e.g. Kickoff call 2025-04-01, requirements doc v2" className="field-input" />
        </div>

        <div className="flex gap-3 pt-2">
          <SubmitButton pendingText="Adding…" className="btn-cta flex-1">
            Add Requirement
          </SubmitButton>
          <Link href={`/${org}/${project}/requirements`} className="btn-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
