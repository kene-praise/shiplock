import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ org: string; project: string; id: string }>;
}

export default async function ScopeChangeDetailPage({ params }: Props) {
  const { org, project, id } = await params;

  // Validate UUID format to prevent database crashes
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    redirect(`/${org}/${project}/scope-changes`);
  }

  redirect(`/${org}/${project}/scope-changes?scope_change=${id}`);
}
