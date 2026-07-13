import Link from "next/link";
import { ArrowLeft, Layers } from "@/components/icons";
import { importRequirementsWithAI } from "@/lib/actions/requirements";
import { getProjectForOrg } from "@/lib/project";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/dashboard-ui";
import { ImportFormClient } from "./ImportFormClient";

interface Props {
  params: Promise<{ org: string; project: string }>;
}

export default async function ImportRequirementsPage({ params }: Props) {
  const { org, project } = await params;
  const projectData = await getProjectForOrg(org, project);
  if (!projectData) notFound();

  const action = importRequirementsWithAI.bind(null, projectData.id, org, project);

  return (
    <div className="min-h-full w-full max-w-[1100px] mx-auto px-8 py-6 flex flex-col gap-4">
      <Link
        href={`/${org}/${project}/requirements`}
        className="inline-flex items-center gap-1.5 text-[12.5px] text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors self-start"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Requirements
      </Link>

      <PageHeader title="AI Requirement Import" meta="Extract requirements and tasks using AI" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        {/* Form area */}
        <div className="md:col-span-2">
          <ImportFormClient action={action} cancelUrl={`/${org}/${project}/requirements`} />
        </div>

        {/* Sidebar helper card */}
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 space-y-4">
          <h2 className="text-[13px] font-semibold text-[var(--fg)] flex items-center gap-2">
            <Layers className="h-4 w-4 text-[var(--accent)]" />
            AI Extraction Tips
          </h2>
          <div className="space-y-3 text-[12px] text-[var(--fg-muted)] leading-relaxed">
            <p>
              Paste your raw product requirements document (PRD), client email threads, kickoff notes, or upload a text file.
            </p>
            <p className="font-semibold text-[var(--fg)]">The AI will automatically:</p>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li>Scrape out actionable client requirements.</li>
              <li>Draft technical tasks needed to build them.</li>
              <li>Link the tasks to their respective parent requirements.</li>
              <li>Categorize requirements (MVP scope, Post-MVP, etc.).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
