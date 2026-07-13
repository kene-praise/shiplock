import Link from "next/link";
import { ArrowLeft } from "@/components/icons";
import { createScopeChange } from "@/lib/actions/scope-changes";
import { SubmitButton } from "@/components/submit-button";
import { getProjectForOrg } from "@/lib/project";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function NewScopeChangePage({ params }: Props) {
  const { org, project } = await params;
  const projectData = await getProjectForOrg(org, project);
  if (!projectData) notFound();
  const action = createScopeChange.bind(null, projectData.id, org, project);

  return (
    <div className="px-5 py-4 max-w-2xl space-y-4">
      <Link
        href={`/${org}/${project}/scope-changes`}
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Scope Changes
      </Link>

      <div>
        <h1 className="text-[15px] font-semibold tracking-tight text-[var(--fg)]">Log Scope Change</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Record any new request from the client that was not in the original scope.
        </p>
      </div>

      <form action={action} className="space-y-5">
        <div className="space-y-1.5">
          <label className="field-label">Title</label>
          <input
            name="title"
            required
            placeholder="Brief description of the change"
            className="field-input"
          />
        </div>

        <div className="space-y-1.5">
          <label className="field-label">Description</label>
          <textarea
            name="description"
            rows={3}
            required
            placeholder="What did the client ask for?"
            className="field-input resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="field-label">Source</label>
            <select
              name="source"
              className="field-input"
            >
              <option value="client_request">Client Request</option>
              <option value="meeting">Meeting</option>
              <option value="internal">Internal</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="field-label">
              Est. Days Impact
            </label>
            <input
              name="estimatedDays"
              type="number"
              min="0"
              placeholder="0"
              className="field-input"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="field-label">Source Detail</label>
          <input
            name="sourceDetail"
            placeholder="e.g. WhatsApp message from CEO, 2025-04-08"
            className="field-input"
          />
        </div>

        <div className="space-y-1.5">
          <label className="field-label">
            Impact Description
          </label>
          <textarea
            name="impactDescription"
            rows={3}
            required
            placeholder="What does this mean for timeline, budget, or effort?"
            className="field-input resize-none"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <SubmitButton
            pendingText="Logging…"
            className="btn-cta flex-1"
          >
            Log Scope Change
          </SubmitButton>
          <Link
            href={`/${org}/${project}/scope-changes`}
            className="btn-secondary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
